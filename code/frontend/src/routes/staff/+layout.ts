import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/stores/auth.svelte';

// Staff pages: only for staff. This is for the user; the real check is the role on the server (ACC-05).
export const load = ({ url }) => {
  if (auth.role !== 'STAFF') redirect(307, `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
};
