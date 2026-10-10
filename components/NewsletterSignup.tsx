'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

type NewsletterSignupProps = {
  /**
   * "footer": the full-size block at the bottom of every page.
   * "story": the compact version at the end of an article, where readers
   * finish. Pages that show it hide the footer one (see .tdd-news--story in
   * globals.css), so a reader is never asked twice on one page.
   */
  variant?: 'footer' | 'story'
}

const COPY = {
  footer: {
    heading: 'Never miss a dribble',
    lede: 'My latest on sports, tech, and the culture around the game, in your inbox.',
  },
  story: {
    heading: 'Get the next one',
    lede: 'New pieces from me, in your inbox.',
  },
}

export default function NewsletterSignup({ variant = 'footer' }: NewsletterSignupProps) {
  const copy = COPY[variant]
  const inputId = `newsletter-email-${variant}`
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
    <div className={variant === 'story' ? 'tdd-news tdd-news--story' : 'tdd-news'}>
      <h2>{copy.heading}</h2>
      <p className="tdd-news-lede">{copy.lede}</p>

      {status === 'success' ? (
        <p className="tdd-news-success" role="status">
          <Check size={20} strokeWidth={2.5} aria-hidden="true" />
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="tdd-news-form">
          <label htmlFor={inputId} className="sr-only">Email address</label>
          <input
            id={inputId}
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
          <p className="tdd-news-fine">
            I respect your privacy. Unsubscribe anytime. <Link href="/privacy">Privacy Policy</Link>
          </p>
        </form>
      )}
    </div>
  )
}
