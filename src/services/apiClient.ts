import { supabase, supabaseConfigured } from '../lib/supabase';

/**
 * Makes an authenticated fetch request by attaching the current session's
 * access token as an Authorization: Bearer header.
 *
 * @param url - The URL to fetch
 * @param options - Optional RequestInit options (same as native fetch)
 * @returns The fetch Response
 * @throws Error if no active session exists (only when Supabase is configured)
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // When Supabase is not configured, fall back to regular fetch (demo mode)
  if (!supabaseConfigured) {
    return fetch(url, options);
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}
