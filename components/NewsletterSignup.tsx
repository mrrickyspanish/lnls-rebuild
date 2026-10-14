'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

import { LANES, type LaneKey } from '@/lib/topics'

type NewsletterSignupProps = {
  /**
   * "footer": the full-size block at the bottom of every page.
   * "story": the compact version at the end of an article, where readers
   * finish. Pages that show it hide the footer one (see .tdd-news--story in
   * globals.css), so a reader is never asked twice on one page.
   * "page": the full block as the main content of /subscribe (also hides
   * the footer one).
   */
  variant?: 'footer' | 'story' | 'page'
}

const COPY = {
  footer: {
    heading: 'Never miss a dribble',
    lede: 'My latest on sports, tech, culture, and life at home, in your inbox.',
  },
  story: {
    heading: 'Get the next one',
    lede: 'New pieces from me, in your inbox.',
  },
  page: {
    heading: 'Get it by email',
    lede: 'Pick your lanes. You only get emails for the ones you check.',
  },
}

const ALL_LANES = LANES.map((lane) => lane.key)

export default function NewsletterSignup({ variant = 'footer' }: NewsletterSignupProps) {
  const copy = COPY[variant]
  const inputId = `newsletter-email-${variant}`
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  // Lane picks: every lane to start. The story version skips the picker and
  // signs up for everything; the reader can narrow it from /subscribe.
  const [lanes, setLanes] = useState<LaneKey[]>(ALL_LANES)
  const showLanes = variant !== 'story'
  const toggleLane = (key: LaneKey) =>
    setLanes((current) => current.includes(key) ? current.filter((k) => k !== key) : [...current, key])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lanes: showLanes ? lanes : ALL_LANES }),
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
    <div className={variant === 'footer' ? 'tdd-news' : `tdd-news tdd-news--${variant}`}>
      <h2>{copy.heading}</h2>
      <p className="tdd-news-lede">{copy.lede}</p>

      {status === 'success' ? (
        <p className="tdd-news-success" role="status">
          <Check size={20} strokeWidth={2.5} aria-hidden="true" />
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="tdd-news-form">
          {showLanes && (
            <fieldset className="tdd-lanes">
              <legend>What do you want?</legend>
              <div>
                {LANES.map((lane) => (
                  <label key={lane.key} className="tdd-lane-pick" data-family={lane.family}>
                    <input
                      type="checkbox"
                      checked={lanes.includes(lane.key)}
                      onChange={() => toggleLane(lane.key)}
                    />
                    <span>{lane.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
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
          <button type="submit" className="tdd-cta" disabled={status === 'loading' || (showLanes && lanes.length === 0)}>
            {status === 'loading' ? 'Subscribing' : 'Subscribe'}
          </button>
          {showLanes && lanes.length === 0 && <p className="tdd-form-error">Pick at least one lane.</p>}
          {status === 'error' && <p className="tdd-form-error" role="alert">{message}</p>}
          <p className="tdd-news-fine">
            I respect your privacy. Unsubscribe anytime. <Link href="/privacy">Privacy Policy</Link>
          </p>
        </form>
      )}
    </div>
  )
}
