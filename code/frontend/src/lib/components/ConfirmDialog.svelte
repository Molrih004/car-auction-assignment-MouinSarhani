<script lang="ts">
  import type { Snippet } from 'svelte';

  // A real <dialog>: focus stays inside, Esc closes it, and screen readers announce it as a dialog
  let { open, title, confirmLabel, busy = false, onconfirm, oncancel, children }: {
    open: boolean;
    title: string;
    confirmLabel: string;
    busy?: boolean;
    onconfirm: () => void;
    oncancel: () => void;
    children?: Snippet;
  } = $props();

  let dialog: HTMLDialogElement;
  let cancelButton: HTMLButtonElement;

  $effect(() => {
    if (open && !dialog.open) {
      dialog.showModal();
      // Focus on "No, go back", so pressing Enter by accident doesn't cancel an auction
      cancelButton.focus();
    }
    if (!open && dialog.open) dialog.close();
  });
</script>

<dialog bind:this={dialog} aria-labelledby="dialog-title" oncancel={(e) => { e.preventDefault(); oncancel(); }}>
  <h2 id="dialog-title">{title}</h2>
  {@render children?.()}
  <div class="actions">
    <button type="button" class="btn" disabled={busy} onclick={onconfirm}>{busy ? 'One moment...' : confirmLabel}</button>
    <button bind:this={cancelButton} type="button" class="btn ghost" onclick={oncancel}>No, go back</button>
  </div>
</dialog>

<style>
  dialog { border: 0; border-radius: 10px; padding: 24px; width: min(540px, calc(100vw - 32px)); background: var(--card); color: var(--ink); }
  dialog::backdrop { background: rgba(30, 42, 35, .45); }
  .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
</style>
