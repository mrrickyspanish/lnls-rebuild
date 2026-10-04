import { createBrowserClient } from '@supabase/ssr'

/** Browser client. Stores the session in cookies, which middleware then reads. */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const AUTH_COOKIE = /(?:^|;\s*)sb-[^=]+-auth-token/

/**
 * Resolves once the Supabase session cookie is present (or, with
 * `present: false`, gone), or after `timeoutMs`.
 *
 * signInWithPassword() and signOut() resolve a beat BEFORE the browser client
 * has written or cleared the cookie. Navigating immediately sends the next
 * request with the old cookie state, so middleware sees a signed-out user right
 * after a successful login (observed: the first /admin request carried no
 * cookie, which arrived ~70ms later). Waiting for the real cookie state makes
 * the hand-off deterministic instead of racy.
 */
export async function waitForSessionCookie({ present, timeoutMs = 3000 }: { present: boolean; timeoutMs?: number }) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (AUTH_COOKIE.test(document.cookie) === present) return
    await new Promise(resolve => setTimeout(resolve, 25))
  }
}
