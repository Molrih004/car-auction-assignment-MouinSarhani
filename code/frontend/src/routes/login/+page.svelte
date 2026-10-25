<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { login } from '$lib/api/auth';
  import { ApiError } from '$lib/api/client';
  import { auth } from '$lib/stores/auth.svelte';
  import { bidDraft } from '$lib/stores/bidDraft';
  import { euros } from '$lib/utils/format';
  import MessageBox from '$lib/components/MessageBox.svelte';

  let email = $state('');
  let password = $state('');
  let error = $state<string | null>(null);
  let busy = $state(false);

  // Where to go after logging in, for example back to the auction (screen B6 → B2)
  const redirect = $derived(page.url.searchParams.get('redirect'));
  const draftAmount = $derived.by(() => {
    const match = redirect?.match(/^\/auctions\/([^/?]+)/);
    return match ? bidDraft.get(match[1]) : null;
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = null;
    busy = true;
    // An old token from an earlier visit must not be sent with the login itself
    if (auth.token) auth.logout();
    try {
      const result = await login(email.trim(), password);
      auth.login(result.token, result.user);
      goto(redirect ?? (result.user.role === 'STAFF' ? '/staff' : '/'), { replaceState: true });
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Something went wrong. Please try again.';
    } finally {
      busy = false;
    }
  }
</script>

<main class="page narrow">
  <h1>{auth.expired ? 'Log in again' : 'Log in'}</h1>

  {#if auth.expired}
    <MessageBox kind="error" title="Your login has expired.">
      Log in again and you go straight back.
      {#if draftAmount}Your bid of {euros(draftAmount)} is not lost.{/if}
    </MessageBox>
  {:else if draftAmount}
    <p class="muted">Log in to place your bid of {euros(draftAmount)}. You go straight back to the auction.</p>
  {/if}

  <form class="card" novalidate onsubmit={submit}>
    {#if error}<MessageBox kind="error" title="We couldn't log you in.">{error}</MessageBox>{/if}

    <label for="email">Email</label>
    <input id="email" bind:value={email} type="email" autocomplete="username" required />

    <label for="password" class="gap">Password</label>
    <input id="password" bind:value={password} type="password" autocomplete="current-password" required />

    <button class="btn block gap" type="submit" disabled={busy}>
      {busy ? 'Logging in...' : redirect ? 'Log in and go back' : 'Log in'}
    </button>
    <p class="small muted gap">Demo accounts: buyer@example.com, buyer2@example.com, staff@example.com (password supersecret1)</p>
  </form>
</main>

<style>
  .narrow { max-width: 460px; }
  .gap { margin-top: 14px; }
</style>
