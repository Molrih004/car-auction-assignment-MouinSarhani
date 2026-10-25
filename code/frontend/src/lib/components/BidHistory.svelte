<script lang="ts">
  import type { Bid } from '$lib/api/types';
  import { dateTime, euros } from '$lib/utils/format';

  let { bids }: { bids: Bid[] } = $props();

  // Only the last 5, so the page stays short on a phone. The rest is one tap away.
  let showAll = $state(false);
  const shown = $derived(showAll ? bids : bids.slice(0, 5));
</script>

<section class="card" aria-labelledby="history-title">
  <h3 id="history-title">Bid history</h3>
  {#if !bids.length}
    <p class="muted small">No bids yet. The first bid has to be at least the starting price.</p>
  {:else}
    <table>
      <thead><tr><th scope="col">Amount</th><th scope="col">Time</th></tr></thead>
      <tbody>
        {#each shown as bid (bid.id)}
          <tr>
            <td>{euros(bid.amount)}{#if bid.isMine}<span class="you">(you)</span>{/if}</td>
            <td>{dateTime(bid.placedAt)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
  <p class="small muted note">
    Bidders are not shown.
    {#if bids.length > 5}
      <button type="button" class="link" onclick={() => (showAll = !showAll)}>
        {showAll ? 'Show the last 5' : `Show all ${bids.length} bids`}
      </button>
    {/if}
  </p>
</section>

<style>
  .note { margin-top: 8px; }
  .you { margin-left: 5px; }
  .link { background: none; border: 0; padding: 0; color: var(--accent); text-decoration: underline; font: inherit; cursor: pointer; }
</style>
