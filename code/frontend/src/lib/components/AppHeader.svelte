<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.svelte';

  const ROLE_LABEL = { BUYER: 'Buyer', SELLER: 'Seller', STAFF: 'Staff' } as const;

  function logout() {
    auth.logout();
    goto('/');
  }
</script>

<header class="top">
  <a href="/" class="brand">VeloVault</a>
  <nav class="user small">
    {#if auth.role === 'STAFF'}<a href="/staff">Staff</a>{/if}
    {#if auth.user}
      <span>{auth.user.name} · {ROLE_LABEL[auth.user.role]}</span>
      <button type="button" class="link" onclick={logout}>Log out</button>
    {:else}
      <a href="/login">Log in</a>
    {/if}
  </nav>
</header>

<style>
  .top {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 14px 16px; border-bottom: 1px solid var(--line); background: var(--card);
  }
  .brand { font-size: 22px; letter-spacing: .5px; color: var(--accent); text-decoration: none; font-family: Georgia, "Times New Roman", serif; }
  .user { display: flex; align-items: center; gap: 14px; color: var(--muted); flex-wrap: wrap; justify-content: flex-end; }
  .link { background: none; border: 0; padding: 0; color: var(--accent); text-decoration: underline; font: inherit; cursor: pointer; }
</style>
