<script lang="ts">
  import type { Snippet } from 'svelte';

  // A message in normal language, for errors and confirmations (NFR-03). role="alert" makes screen readers read it out.
  let { kind, title, children }: { kind: 'error' | 'ok'; title: string; children?: Snippet } = $props();
</script>

<div class="msg {kind}" role={kind === 'error' ? 'alert' : 'status'}>
  <b>{title}</b>
  {@render children?.()}
</div>

<style>
  .msg { border-radius: 6px; padding: 12px 14px; margin: 12px 0; font-size: 15px; border: 1px solid; }
  .msg b { display: block; margin-bottom: 2px; }
  .error { background: var(--error-bg); border-color: var(--error-line); }
  .ok { background: var(--ok-bg); border-color: var(--ok-line); }
</style>
