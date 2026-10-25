<script lang="ts">
  import type { Auction } from '$lib/api/types';
  import { statusWords } from '$lib/utils/format';

  let { auction, now }: { auction: Auction; now: number } = $props();

  // BRW-05: always words. The dot is extra, the meaning never depends on its colour.
  const status = $derived(statusWords(auction, now));
</script>

<span class="status {status.kind}">{status.label}</span>

<style>
  .status {
    display: inline-flex; align-items: center; gap: 6px; font-size: 14px;
    padding: 3px 10px; border: 1px solid var(--line); border-radius: 999px; background: var(--card);
  }
  .status::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
  .open { color: var(--accent); }
  .pending { color: var(--pending); }
  .closed { color: var(--closed); }
  .cancelled { color: var(--cancelled); }
</style>
