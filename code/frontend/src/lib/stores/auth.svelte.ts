import type { User } from '$lib/api/types';

const STORAGE_KEY = 'velovault.auth';

const read = (): { token: string; user: User } | null => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
};

/**
 * The logged in user, shared by the whole app. The fields are $state (Svelte 5 runes), so every
 * component that reads them updates by itself when they change, for example the header after logging in.
 */
class AuthStore {
  token = $state<string | null>(null);
  user = $state<User | null>(null);
  // True after the server said the login expired, so the login page can explain why (use case 1, path 2a)
  expired = $state(false);

  constructor() {
    const saved = read();
    this.token = saved?.token ?? null;
    this.user = saved?.user ?? null;
  }

  get isLoggedIn() {
    return this.token !== null;
  }

  get role() {
    return this.user?.role ?? null;
  }

  login(token: string, user: User) {
    this.token = token;
    this.user = user;
    this.expired = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Called by the API client on a 401
  expire() {
    if (this.token) this.expired = true;
    this.logout();
  }
}

export const auth = new AuthStore();
