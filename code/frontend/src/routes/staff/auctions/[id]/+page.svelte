<script lang="ts">
  import { page } from '$app/state';
  import { changeStatus, getAuction, getBids, updateAuctionTimes } from '$lib/api/auctions';
  import { getCar } from '$lib/api/cars';
  import { getUsers } from '$lib/api/users';
  import { ApiError } from '$lib/api/client';
  import type { Auction, Bid, Car, User } from '$lib/api/types';
  import { dateTime, euros } from '$lib/utils/format';
  import { STAFF_TRANSITIONS, actionLabel, statusName } from '$lib/utils/status';
  import { createNow } from '$lib/utils/now.svelte';
  import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
  import MessageBox from '$lib/components/MessageBox.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';

  const id = $derived(page.params.id);
  const now = createNow();

  let auction = $state<Auction | null>(null);
  let car = $state<Car | null>(null);
  let bids = $state<Bid[]>([]);
  let users = $state<Map<number, User>>(new Map());
  let loadError = $state<string | null>(null);

  // The change waiting for "Are you sure?" (S3), and the result afterwards (S4 or S5)
  let pending = $state<'PENDING' | 'CANCELLED' | null>(null);
  let busy = $state(false);
  let result = $state<{ kind: 'ok' | 'error'; title: string; text: string } | null>(null);

  const carName = $derived(car ? `${car.make} ${car.model}, ${car.year}` : 'this car');
  const seller = $derived(auction ? users.get(auction.sellerId) : undefined);
  // Step 3: only the allowed changes become buttons
  const allowed = $derived(auction ? STAFF_TRANSITIONS[auction.status] : []);

  async function load() {
    try {
      const [a, b, u] = await Promise.all([getAuction(id), getBids(id), getUsers()]);
      auction = a;
      bids = b;
      users = new Map(u.map((user) => [user.id, user]));
      car ??= await getCar(a.carId);
      loadError = null;
    } catch (e) {
      loadError = e instanceof ApiError ? e.message : 'Something went wrong.';
    }
  }

  async function confirm() {
    if (!pending || !auction) return;
    busy = true;
    const target = pending;
    try {
      auction = await changeStatus(auction.id, target);
      result = {
        kind: 'ok',
        title: `The status of ${carName} is now ${statusName[auction.status]}.`,
        text: target === 'PENDING'
          ? 'Buyers can\'t bid until you set a new start time below.'
          : 'Buyers and the seller see the new status straight away.',
      };
    } catch (e) {
      // S5: not allowed anymore, for example the auction ended while the page was open (8a, 8b)
      result = { kind: 'error', title: e instanceof ApiError ? e.message : 'Something went wrong.', text: 'Nothing was changed.' };
    } finally {
      busy = false;
      pending = null;
      load();
    }
  }

  // After "back to pending": choose new times, so the scheduler can start the auction again
  let newStart = $state('');
  let newEnd = $state('');
  let timesError = $state<string | null>(null);

  async function saveTimes(event: SubmitEvent) {
    event.preventDefault();
    if (!auction) return;
    timesError = null;
    if (!newStart || !newEnd) {
      timesError = 'Fill in a new start and end.';
      return;
    }
    try {
      // datetime-local is the time on Sandra's computer; toISOString sends it as UTC
      auction = await updateAuctionTimes(auction.id, new Date(newStart).toISOString(), new Date(newEnd).toISOString());
      result = { kind: 'ok', title: `${carName} starts on ${dateTime(auction.startAt)}.`, text: 'The auction starts by itself at that time.' };
      newStart = '';
      newEnd = '';
    } catch (e) {
      timesError = e instanceof ApiError ? e.message : 'Something went wrong.';
    }
  }

  $effect(() => {
    load();
  });
</script>

<main class="page wide">
  <a href="/staff" class="back">‹ Back to search results</a>
  {#if loadError}<MessageBox kind="error" title="We can't show this auction right now.">{loadError}</MessageBox>{/if}

  {#if auction}
    <div class="cols">
      <div>
        <div class="photo hero" aria-hidden="true">photo</div>
        <h1>{carName}</h1>
        <p class="muted">Seller: {seller?.name ?? `User ${auction.sellerId}`} · {seller?.email ?? ''}</p>

        <section class="card">
          <h3>Bids (only staff can see the bidder)</h3>
          {#if !bids.length}
            <p class="muted small">No bids yet.</p>
          {:else}
            <table>
              <thead><tr><th scope="col">Amount</th><th scope="col">Time</th><th scope="col">Buyer</th></tr></thead>
              <tbody>
                {#each bids as bid (bid.id)}
                  <tr>
                    <td>{euros(bid.amount)}</td>
                    <td>{dateTime(bid.placedAt)}</td>
                    <td>{bid.buyerId !== undefined ? users.get(bid.buyerId)?.name ?? `User ${bid.buyerId}` : ''}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </section>
      </div>

      <div>
        {#if result}<MessageBox kind={result.kind} title={result.title}>{result.text}</MessageBox>{/if}

        <section class="card">
          <h2>Status</h2>
          <StatusBadge {auction} now={now.value} />
          <dl class="facts">
            <div><dt class="k">Starts</dt><dd class="v small-v">{dateTime(auction.startAt)}</dd></div>
            <div><dt class="k">Ends</dt><dd class="v small-v">{dateTime(auction.endAt)}</dd></div>
            <div><dt class="k">Current bid</dt><dd class="v">{auction.currentBid !== null ? euros(auction.currentBid) : '–'}</dd></div>
            <div><dt class="k">Bids</dt><dd class="v">{auction.bidCount}</dd></div>
            <div><dt class="k">Reserve</dt><dd class="v small-v">{auction.reservePrice !== undefined ? euros(auction.reservePrice) : '–'} · {auction.reserveReached ? 'reached' : 'not reached'}</dd></div>
          </dl>

          {#if allowed.length}
            <h3>Change status to</h3>
            <p class="small muted">Only the changes that are allowed from {statusName[auction.status]} are shown.</p>
            <div class="stack">
              {#each allowed as target (target)}
                <button type="button" class="btn ghost block" onclick={() => { pending = target; result = null; }}>{actionLabel[target]}</button>
              {/each}
            </div>
          {:else}
            <p class="small muted">{statusName[auction.status]} is final, this auction can't be changed anymore.</p>
          {/if}
        </section>

        {#if auction.status === 'PENDING'}
          <form class="card" onsubmit={saveTimes}>
            <h3>{auction.onHold ? 'Set a new start time' : 'Correct the start and end'}</h3>
            {#if timesError}<MessageBox kind="error" title="The times are not saved.">{timesError}</MessageBox>{/if}
            <label for="start">New start</label>
            <input id="start" bind:value={newStart} type="datetime-local" />
            <label for="end" class="gap">New end</label>
            <input id="end" bind:value={newEnd} type="datetime-local" />
            <button type="submit" class="btn block gap">Save times</button>
          </form>
        {/if}
      </div>
    </div>

    <!-- S3: Are you sure? Shows exactly which auction, so the wrong Porsche 911 can't be cancelled (STF-04) -->
    <ConfirmDialog
      open={pending !== null}
      title={pending === 'CANCELLED' ? 'Are you sure you want to cancel this auction?' : 'Are you sure you want to put this auction back to pending?'}
      confirmLabel={pending === 'CANCELLED' ? 'Yes, cancel auction' : 'Yes, back to pending'}
      {busy}
      onconfirm={confirm}
      oncancel={() => (pending = null)}
    >
      <table>
        <tbody>
          <tr><th scope="row">Car</th><td><b>{carName}</b></td></tr>
          <tr><th scope="row">Seller</th><td>{seller?.name ?? `User ${auction.sellerId}`}</td></tr>
          <tr><th scope="row">Ends</th><td>{dateTime(auction.endAt)}</td></tr>
          <tr><th scope="row">Bids</th><td>{auction.bidCount} bids{auction.currentBid !== null ? `, current bid ${euros(auction.currentBid)}` : ''}</td></tr>
          <tr><th scope="row">Status</th><td>{statusName[auction.status]} → <b>{pending ? statusName[pending] : ''}</b></td></tr>
        </tbody>
      </table>
      <p class="small muted gap">
        {pending === 'CANCELLED' ? 'A cancelled auction can\'t be opened again. Buyers can\'t bid anymore.' : 'Buyers can\'t bid until you set a new start time. The bids stay.'}
      </p>
    </ConfirmDialog>
  {/if}
</main>

<style>
  .back { display: inline-block; margin-bottom: 12px; text-decoration: none; }
  .cols { display: grid; grid-template-columns: 1fr 420px; gap: 24px; align-items: start; }
  .hero { height: 280px; margin-bottom: 14px; }
  .small-v { font-size: 15px; }
  .stack { display: grid; gap: 8px; }
  .gap { margin-top: 12px; }
  dd { margin: 0; }
  @media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
</style>
