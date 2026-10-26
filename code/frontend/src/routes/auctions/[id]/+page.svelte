<script lang="ts">
  import { page } from '$app/state';
  import { getAuction, getBids } from '$lib/api/auctions';
  import { getCar } from '$lib/api/cars';
  import { ApiError } from '$lib/api/client';
  import type { Auction, Bid, Car, PlaceBidResult } from '$lib/api/types';
  import { createNow, poll } from '$lib/utils/now.svelte';
  import { conditionHelp, conditionLabel, euros, isOpen, km, time } from '$lib/utils/format';
  import AuctionFacts from '$lib/components/AuctionFacts.svelte';
  import BidForm from '$lib/components/BidForm.svelte';
  import BidHistory from '$lib/components/BidHistory.svelte';
  import CarPhoto from '$lib/components/CarPhoto.svelte';
  import MessageBox from '$lib/components/MessageBox.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';

  const id = $derived(page.params.id);
  const now = createNow();

  let auction = $state<Auction | null>(null);
  let car = $state<Car | null>(null);
  let bids = $state<Bid[]>([]);
  let error = $state<string | null>(null);
  // The confirmation of the last bid (step 6 of use case 1)
  let placed = $state<PlaceBidResult | null>(null);

  // Reactive: becomes false by itself the second the end time passes, and the bid form disappears (B5)
  const open = $derived(!!auction && isOpen(auction, now.value));
  const myBidIsHighest = $derived(bids[0]?.isMine === true);

  async function load() {
    try {
      [auction, bids] = await Promise.all([getAuction(id), getBids(id)]);
      car ??= await getCar(auction.carId);
      error = null;
    } catch (e) {
      // NFR-10: keep showing what we had and say why it isn't fresh
      error = e instanceof ApiError ? e.message : 'Something went wrong.';
    }
  }

  function onplaced(result: PlaceBidResult) {
    placed = result;
    load();
  }

  $effect(() => {
    load();
  });
  // Other buyers bid too: reload the current bid and the history every 5 seconds
  poll(load, 5000);
</script>

<main class="page">
  <a href="/" class="back" onclick={(e) => { e.preventDefault(); history.back(); }}>‹ Back to the list (your filters stay)</a>

  {#if error && !auction}
    <MessageBox kind="error" title="We can't show this auction right now.">{error}</MessageBox>
  {/if}

  {#if auction}
    <CarPhoto carId={auction.carId} alt={car ? `${car.make} ${car.model} from ${car.year}, ${car.color}` : ''} class="hero" />

    {#if car}
      <h1>{car.make} {car.model}, {car.year}</h1>
      <p class="muted small">
        {car.color} · {km(car.mileage)} ·
        condition: <abbr title={conditionHelp[car.condition]}>{conditionLabel[car.condition]}</abbr>
      </p>
    {/if}

    <StatusBadge {auction} now={now.value} />
    {#if error}<MessageBox kind="error" title="This page may not be up to date.">{error}</MessageBox>{/if}

    <!-- Step 6: the confirmation (BID-04) -->
    {#if placed}
      <MessageBox kind="ok" title="Your bid is placed.">
        {euros(placed.bid.amount)} at {time(placed.bid.placedAt)}.
        {myBidIsHighest ? 'You are now the highest bidder.' : 'Someone has bid higher since then.'}
      </MessageBox>
    {/if}

    <AuctionFacts {auction} now={now.value} mine={myBidIsHighest} />

    {#if open}
      <BidForm {auction} {onplaced} onchanged={load} />
    {:else if auction.status === 'PENDING'}
      <MessageBox kind="error" title={auction.onHold ? 'VeloVault has paused this auction.' : 'This auction hasn\'t started yet.'}>
        {auction.onHold ? 'You can bid again when it has a new start time.' : 'You can bid from the start time above.'}
      </MessageBox>
    {:else}
      <MessageBox kind="error" title={auction.status === 'CANCELLED' ? 'This auction is cancelled.' : 'This auction is closed.'}>
        You can't bid anymore. The final price and the bid history stay here.
      </MessageBox>
    {/if}

    <BidHistory {bids} />

    {#if car?.description}
      <section class="card">
        <h3>About this car</h3>
        <p>{car.description}</p>
      </section>
    {/if}
  {/if}
</main>

<style>
  .back { display: inline-block; margin-bottom: 12px; text-decoration: none; }
  :global(.photo.hero) { height: 220px; margin-bottom: 12px; }
  abbr { text-decoration: underline dotted; cursor: help; }
</style>
