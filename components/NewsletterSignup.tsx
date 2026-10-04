'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        // There is no confirmation step: a subscriber is active the moment they
        // submit. The old copy told them to "check your email to confirm".
        setMessage("You're on the list. New stories will land in your inbox.")
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="tdd-news">
      <h2>Never miss a dribble</h2>
      <p className="tdd-news-lede">
        New stories from The Daily Dribble: sports, tech, and the culture around the game.
      </p>

      {status === 'success' ? (
        <p className="tdd-news-success" role="status">
          <Check size={20} strokeWidth={2.5} aria-hidden="true" />
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="tdd-news-form">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <button type="submit" className="tdd-cta" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing' : 'Subscribe'}
          </button>
          {status === 'error' && <p className="tdd-form-error" role="alert">{message}</p>}
          <p className="tdd-news-fine">We respect your privacy. Unsubscribe anytime.</p>
        </form>
      )}
    </div>
  )
}
