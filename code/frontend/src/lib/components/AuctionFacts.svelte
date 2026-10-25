<script lang="ts">
  import type { Auction } from '$lib/api/types';
  import { dateTime, endsWithinADay, euros, timeLeft } from '$lib/utils/format';

  let { auction, now, mine = false }: { auction: Auction; now: number; mine?: boolean } = $props();

  const closed = $derived(auction.status === 'ENDED' || new Date(auction.endAt).getTime() <= now);
  // BRW-06: the time left only shows in the last 24 hours, before that the end date is enough
  const showTimeLeft = $derived(auction.status === 'ACTIVE' && endsWithinADay(auction.endAt, now));
</script>

<dl class="facts">
  <div>
    <dt class="k">{closed ? 'Final bid' : 'Current bid'}</dt>
    <dd class="v">
      {#if auction.currentBid !== null}{euros(auction.currentBid)}{#if mine}<span class="small you">(yours)</span>{/if}{:else}No bids yet{/if}
    </dd>
  </div>
  <div>
    <dt class="k">Bids</dt>
    <dd class="v">{auction.bidCount}</dd>
  </div>
  <div>
    <dt class="k">{closed ? 'Ended' : auction.status === 'PENDING' ? 'Starts' : 'Ends'}</dt>
    <dd class="v date">{dateTime(auction.status === 'PENDING' ? auction.startAt : auction.endAt)}</dd>
  </div>
  {#if showTimeLeft}
    <div>
      <dt class="k">Time left</dt>
      <dd class="v left">{timeLeft(auction.endAt, now)}</dd>
    </div>
  {:else if auction.currentBid === null && auction.status !== 'ENDED'}
    <div>
      <dt class="k">Starting price</dt>
      <dd class="v">{euros(auction.startingPrice)}</dd>
    </div>
  {/if}
</dl>

<style>
  dl { margin: 12px 0; }
  dd { margin: 0; }
  .date { font-size: 16px; }
  .you { margin-left: 5px; }
  .left { color: var(--accent); font-variant-numeric: tabular-nums; }
</style>
