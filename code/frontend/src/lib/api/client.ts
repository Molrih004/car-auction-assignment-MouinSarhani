import { env } from '$env/dynamic/public';
import { auth } from '$lib/stores/auth.svelte';

// The frontend only talks to the API gateway (CON-02)
const API_URL = env.PUBLIC_API_URL || 'http://localhost:3000';

/**
 * An error from the API. `message` is normal language from the server and can be shown to the user directly (NFR-03).
 * `code` tells the page what to do, for example go back to the bid form.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/**
 * One function for every call to the backend (AJAX with fetch).
 * It adds the login token, reads the JSON and turns every kind of failure into an ApiError.
 */
export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = auth.token;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // The gateway itself can't be reached (no network, or not running)
    throw new ApiError(0, 'NETWORK_ERROR', 'We can\'t reach VeloVault right now. Check your connection and try again.');
  }

  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const error = json?.error;
    if (response.status === 401 && token) {
      if (auth.token === token) auth.expire();
      // Reading cars and auctions doesn't need a login: try once more without the expired token
      if (method === 'GET') return api<T>(method, path);
    }
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.details,
    );
  }
  return json as T;
}
