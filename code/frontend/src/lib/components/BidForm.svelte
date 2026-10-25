<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { placeBid } from '$lib/api/auctions';
  import { ApiError } from '$lib/api/client';
  import type { Auction, PlaceBidResult } from '$lib/api/types';
  import { auth } from '$lib/stores/auth.svelte';
  import { bidDraft } from '$lib/stores/bidDraft';
  import { euros } from '$lib/utils/format';
  import MessageBox from './MessageBox.svelte';

  let { auction, onplaced, onchanged }: {
    auction: Auction;
    onplaced: (result: PlaceBidResult) => void;
    onchanged: () => void;
  } = $props();

  // The typed amount survives a reload or the trip to the login page (use case 1, path 2a)
  let amountText = $state(bidDraft.get(auction.id)?.toString() ?? '');
  let error = $state<{ title: string; text: string } | null>(null);
  let busy = $state(false);
  // After "someone was faster" the server tells us the new lowest amount before the next poll does
  let serverLowest = $state<number | null>(null);

  // BID-02: higher than the current bid, or at least the starting price for the first bid
  const lowestAllowed = $derived(Math.max(
    auction.currentBid !== null ? auction.currentBid + 1 : auction.startingPrice,
    serverLowest ?? 0,
  ));

  // "18.500", "€ 18500" and "18 500" all mean 18500
  const amount = $derived.by(() => {
    const digits = amountText.replace(/[€.\s]/g, '');
    return /^\d+$/.test(digits) ? Number(digits) : null;
  });

  // Every change of the amount is saved, so it is still there after logging in
  $effect(() => {
    bidDraft.set(auction.id, amount);
  });

  const isBuyer = $derived(auth.role === 'BUYER');

  function goToLogin() {
    bidDraft.set(auction.id, amount);
    goto(`/login?redirect=${encodeURIComponent(page.url.pathname + page.url.search)}`);
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    // Only a quick check in the browser so Tom sees it straight away. The real rules are on the server (ACC-05).
    if (amount === null) {
      error = { title: 'Fill in an amount.', text: 'Use whole euros, for example 18500.' };
      return;
    }

    busy = true;
    try {
      const result = await placeBid(auction.id, amount);
      amountText = '';
      serverLowest = null;
      onplaced(result);
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
      switch (e.code) {
        case 'BID_TOO_LOW': // 4a, 5a: keep the amount, show the new lowest bid
          serverLowest = Number(e.details.lowestAllowed) || null;
          error = {
            title: e.message.startsWith('Someone') ? 'Someone placed a higher bid just before you.' : 'Your bid is too low.',
            text: `Your bid has to be at least ${euros(lowestAllowed)}. Your amount is still in the field.`,
          };
          onchanged();
          break;
        case 'UNAUTHORIZED': // 2a
          goToLogin();
          break;
        case 'AUCTION_CLOSED': // 3b
        case 'AUCTION_NOT_STARTED': // 3a
          error = { title: e.message, text: '' };
          onchanged();
          break;
        default: // 5b, the service is down, or something else
          error = { title: 'We can\'t place your bid right now.', text: e.message };
      }
    } finally {
      busy = false;
    }
  }
</script>

<form class="card" novalidate onsubmit={submit}>
  {#if error}<MessageBox kind="error" title={error.title}>{error.text}</MessageBox>{/if}

  {#if !auth.isLoggedIn}
    <label for="amount">Your bid</label>
    <div class="input-wrap"><span aria-hidden="true">€</span><input id="amount" bind:value={amountText} inputmode="numeric" autocomplete="off" /></div>
    <p class="hint">Lowest allowed bid: {euros(lowestAllowed)}</p>
    <button type="button" class="btn block" onclick={goToLogin}>Log in to place your bid</button>
  {:else if !isBuyer}
    <p class="muted">Only buyers can place a bid. You are logged in as {auth.role?.toLowerCase()}.</p>
  {:else}
    <label for="amount">Your bid</label>
    <div class="input-wrap">
      <span aria-hidden="true">€</span>
      <input
        id="amount" bind:value={amountText} inputmode="numeric" autocomplete="off"
        aria-invalid={!!error} aria-describedby="lowest"
      />
    </div>
    <p id="lowest" class="hint">Lowest allowed bid: {euros(lowestAllowed)}</p>
    <!-- Big and full width, under the thumb on a phone (Fitts's law) -->
    <button type="submit" class="btn block" disabled={busy}>{busy ? 'Placing your bid...' : 'Place bid'}</button>
  {/if}
</form>

<style>
  .input-wrap { position: relative; }
  .input-wrap span { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 17px; }
  .input-wrap input { padding-left: 30px; }
  .hint { font-size: 14px; color: var(--muted); margin: 6px 0 12px; }
</style>
