import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getSupabaseAndResponse } from '@/lib/supabase/middleware'
import { getSessionRole } from '@/lib/auth/session'

/**
 * Gates /admin behind a real Supabase account that has an active admin_profiles
 * row. This replaces HTTP Basic auth with one shared password, which nobody
 * could recover and which had a fallback literal in the source. Same model as
 * the clw-wizards admin: per-person accounts, role checked server-side.
 *
 * Admin-only API routes are NOT covered by this matcher and guard themselves
 * with requireAdmin() from lib/auth/guard.ts.
 */
export async function middleware(req: NextRequest) {
  const { supabase, response } = await getSupabaseAndResponse(req)
  const { user, isAdmin } = await getSessionRole(supabase)

  const deny = (search: Record<string, string>) => {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    for (const [key, value] of Object.entries(search)) url.searchParams.set(key, value)
    const redirect = NextResponse.redirect(url)
    // Keep any session cookies Supabase just refreshed.
    response().cookies.getAll().forEach(cookie => redirect.cookies.set(cookie))
    redirect.headers.set('Cache-Control', 'private, no-store')
    return redirect
  }

  if (!user) return deny({ redirectTo: `${req.nextUrl.pathname}${req.nextUrl.search}` })
  if (!isAdmin) return deny({ denied: '1' })

  const allowed = response()
  allowed.headers.set('Cache-Control', 'private, no-store')
  return allowed
}

export const config = {
  matcher: '/admin/:path*',
}
