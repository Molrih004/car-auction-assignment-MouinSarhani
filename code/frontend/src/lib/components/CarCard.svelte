<script lang="ts">
  import type { Listing } from '$lib/api/types';
  import { dateTime, endsWithinADay, euros, isOpen, timeLeft } from '$lib/utils/format';
  import StatusBadge from './StatusBadge.svelte';

  let { listing, now }: { listing: Listing; now: number } = $props();
</script>

<a href="/auctions/{listing.auction.id}" class="card listing">
  <div class="photo thumb" aria-hidden="true">photo</div>
  <div>
    <h3>{listing.car.make} {listing.car.model}, {listing.car.year}</h3>
    <StatusBadge auction={listing.auction} {now} />
    <!-- UXD walkthrough F1: Tom wants to see from the list which auction ends first -->
    {#if isOpen(listing.auction, now)}
      <p class="small ends">
        Ends {dateTime(listing.auction.endAt)}{#if endsWithinADay(listing.auction.endAt, now)}<b class="left">· {timeLeft(listing.auction.endAt, now)} left</b>{/if}
      </p>
    {/if}
    <p class="small muted info">
      {#if listing.auction.currentBid !== null}
        Current bid {euros(listing.auction.currentBid)} · {listing.auction.bidCount} bids
      {:else}
        No bids yet · starting price {euros(listing.auction.startingPrice)}
      {/if}
    </p>
  </div>
</a>

<style>
  .listing { display: flex; gap: 14px; text-decoration: none; color: inherit; }
  .listing:hover { border-color: var(--accent); }
  .thumb { flex: none; width: 128px; height: 96px; }
  .info { margin-top: 6px; }
  .ends { margin: 6px 0 0; }
  .left { margin-left: 5px; }
  @media (max-width: 420px) { .thumb { width: 96px; height: 80px; } }
</style>
