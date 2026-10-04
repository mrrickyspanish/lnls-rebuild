import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Who is calling, and are they an admin?
 *
 * An admin is a signed-in Supabase user who also has an ACTIVE row in
 * public.admin_profiles. Being signed in is not enough, which matters if
 * Supabase Auth ever allows public sign-ups: an arbitrary new account has no
 * admin_profiles row and gets nothing. Rows are only ever created server-side
 * with the service role, after the signup code is verified.
 *
 * Mirrors getSessionRole() in clw-wizards, reduced to the one role this site
 * needs. `getUser()` (not `getSession()`) is deliberate: it re-validates the
 * token with Supabase instead of trusting the cookie's contents.
 */
export async function getSessionRole(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, isAdmin: false as const, accessError: null }

  const { data: profile, error } = await supabase
    .from('admin_profiles')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    // Logged server-side only. Typically the migration has not been applied.
    console.error('[auth] could not read admin_profiles:', error.code, error.message)
    return { user, isAdmin: false as const, accessError: error.message }
  }

  return { user, isAdmin: Boolean(profile?.is_active), accessError: null }
}
