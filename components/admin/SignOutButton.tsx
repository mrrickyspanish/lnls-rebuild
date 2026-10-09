'use client'

import { useState } from 'react'

import { createBrowserSupabase, waitForSessionCookie } from '@/lib/supabase/browser'

export default function SignOutButton() {
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    await createBrowserSupabase().auth.signOut()
    // Same hand-off rule as sign-in: only leave once the cookie is really gone.
    await waitForSessionCookie({ present: false })
    window.location.assign('/login')
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="min-h-[44px] text-sm text-neutral-300 hover:text-white underline underline-offset-4 disabled:opacity-50"
    >
      {pending ? 'Signing out' : 'Sign out'}
    </button>
  )
}
