'use client'

import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'

import { createBrowserSupabase, waitForSessionCookie } from '@/lib/supabase/browser'
import { safeInternalPath } from '@/lib/safe-path'

export default function LoginForm() {
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(
    params.get('denied') ? 'That account does not have admin access. Sign in with an admin account.' : null
  )
  const redirectTo = safeInternalPath(params.get('redirectTo')) ?? '/admin'

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { error: signInError } = await createBrowserSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) {
        setError(
          signInError.code === 'invalid_credentials'
            ? 'That email and password do not match.'
            : 'Sign-in failed. Try again in a minute.'
        )
        setPending(false)
        return
      }
      // Wait for the session cookie to actually exist, then do a FULL navigation:
      // it carries the cookie, and unlike router.replace() it cannot reuse a
      // cached redirect to /login from the client router.
      await waitForSessionCookie({ present: true })
      window.location.assign(redirectTo)
    } catch {
      setError('Could not reach the sign-in service. Try again.')
      setPending(false)
    }
  }

  return (
    <form className="tdd-form" onSubmit={onSubmit} noValidate>
      <div className="tdd-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="tdd-field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <p className="tdd-form-error" role="alert">{error}</p>}
      <button type="submit" className="tdd-cta" disabled={pending || !email || !password}>
        {pending ? 'Signing in' : 'Sign in'}
      </button>
    </form>
  )
}
