import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

import { createServerSupabase } from '@/lib/supabase/server'
import { getSessionRole } from '@/lib/auth/session'

/**
 * Guards for admin-only API routes. Middleware only covers /admin pages, so
 * every privileged route handler must call one of these itself. Returns a
 * Response to send back, or null when the caller is allowed to continue:
 *
 *   const denied = await requireAdmin()
 *   if (denied) return denied
 *
 * The browser sends the Supabase session cookie with same-origin fetch()
 * automatically, so the admin UI needs no extra header handling.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createServerSupabase()
  const { user, isAdmin } = await getSessionRole(supabase)

  if (!user) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 })
  }
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 })
  }
  return null
}

/**
 * Vercel invokes cron routes over the public internet, so without this check
 * anyone who finds the path could trigger them. Vercel automatically sends
 * `Authorization: Bearer ${CRON_SECRET}` on cron requests once CRON_SECRET is
 * set as an environment variable. Fails closed when it is unset or too short.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || secret.length < 16) return false

  const expected = Buffer.from(`Bearer ${secret}`)
  const actual = Buffer.from(request.headers.get('authorization') ?? '')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** For machine-run routes an admin may also want to trigger by hand. */
export async function requireAdminOrCron(request: Request): Promise<NextResponse | null> {
  if (isAuthorizedCronRequest(request)) return null
  return requireAdmin()
}
