'use server'

import { createClient } from '@supabase/supabase-js'

import { isAdminSignupOpen, signupCodeMatches } from '@/lib/auth/signup-code'

export type ActionResult = { ok: true } | { ok: false; error: string }

const MIN_PASSWORD = 12
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Untyped service-role client: admin_profiles is not in the generated types. */
function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Create an admin account. Gated entirely by the ADMIN_SIGNUP_CODE environment
 * variable: unset means closed. Runs server-side with the service role and
 * verifies the code BEFORE anything else is touched, because a server action
 * can be called without the page. Ported from clw-wizards' createAdminAccount.
 */
export async function createAdminAccount(values: {
  fullName: string
  email: string
  password: string
  code: string
}): Promise<ActionResult> {
  if (!isAdminSignupOpen()) {
    return { ok: false, error: 'Admin sign-up is closed.' }
  }

  const fullName = String(values.fullName ?? '').trim()
  const email = String(values.email ?? '').trim().toLowerCase()
  const password = String(values.password ?? '')
  const code = String(values.code ?? '').trim()

  if (!fullName || fullName.length > 120) return { ok: false, error: 'Enter your name.' }
  if (!EMAIL.test(email)) return { ok: false, error: 'Enter a valid email.' }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` }
  }

  if (!signupCodeMatches(code)) {
    // Generic, and slowed down, so probing the code is neither informative nor fast.
    await new Promise(resolve => setTimeout(resolve, 600))
    return { ok: false, error: 'That access code is not valid.' }
  }

  const admin = serviceClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (createError || !created.user) {
    const message = createError?.message ?? 'Could not create the account.'
    if (/already/i.test(message)) {
      return { ok: false, error: 'An account with that email already exists. Sign in instead.' }
    }
    return { ok: false, error: message }
  }

  const { error: profileError } = await admin
    .from('admin_profiles')
    .insert({ id: created.user.id, email, full_name: fullName, is_active: true })

  if (profileError) {
    // Roll back the half-created account so the same email and code can retry.
    await admin.auth.admin.deleteUser(created.user.id)
    console.error('[admin-signup] could not create admin_profiles row:', profileError.code, profileError.message)
    if (profileError.code === 'PGRST205' || profileError.code === '42P01') {
      return {
        ok: false,
        error: 'Admin accounts are not set up in the database yet. Run supabase/add_admin_accounts.sql first.',
      }
    }
    return { ok: false, error: 'Could not finish creating the account.' }
  }

  return { ok: true }
}
