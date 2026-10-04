'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

import { createAdminAccount } from './actions'

export default function AdminSignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const result = await createAdminAccount({ fullName, email, password, code })
      if (result.ok) setDone(true)
      else setError(result.error)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div className="tdd-form">
        <p className="tdd-auth-lede">Account created. Sign in with the email and password you just chose.</p>
        <Link href="/login" className="tdd-cta">Go to sign in</Link>
      </div>
    )
  }

  return (
    <form className="tdd-form" onSubmit={onSubmit} noValidate>
      <div className="tdd-field">
        <label htmlFor="fullName">Name</label>
        <input id="fullName" autoComplete="name" required value={fullName} onChange={e => setFullName(e.target.value)} />
      </div>
      <div className="tdd-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="tdd-field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} />
        <p className="tdd-field-help">At least 12 characters. Save it in a password manager.</p>
      </div>
      <div className="tdd-field">
        <label htmlFor="code">Access code</label>
        <input id="code" type="password" autoComplete="off" required value={code} onChange={e => setCode(e.target.value)} />
      </div>
      {error && <p className="tdd-form-error" role="alert">{error}</p>}
      <button type="submit" className="tdd-cta" disabled={pending || !fullName || !email || !password || !code}>
        {pending ? 'Creating account' : 'Create account'}
      </button>
    </form>
  )
}
