'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

import { LANES } from '@/lib/topics'

/**
 * The lane picker on /subscribe/manage. Same chips as the sign-up form.
 * Saving also turns emails back on for someone who had unsubscribed.
 */
export default function ManageLanes({
  token, initial, active: initiallyActive, confirmUnsubscribe = false,
}: { token: string; initial: string[]; active: boolean; confirmUnsubscribe?: boolean }) {
  const [lanes, setLanes] = useState<string[]>(initial)
  const [active, setActive] = useState(initiallyActive)
  const [leaving, setLeaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const toggle = (key: string) => {
    setStatus('idle')
    setLanes((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]))
  }

  const save = async () => {
    setStatus('saving')
    try {
      const response = await fetch('/api/newsletter/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, lanes }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save')
      setStatus('saved')
      setMessage(active ? 'Saved. Your next email follows these picks.' : "You're back on the list with these picks.")
      setActive(true)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not save')
    }
  }

  const unsubscribe = async () => {
    setLeaving(true)
    try {
      const response = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, { method: 'POST' })
      if (!response.ok) throw new Error('Could not unsubscribe. Please try again.')
      setActive(false)
      setStatus('saved')
      setMessage("You're unsubscribed. No more emails. Pick lanes and save if you ever want back in.")
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not unsubscribe')
    } finally {
      setLeaving(false)
    }
  }

  return (
    <div className="tdd-news tdd-news--page">
      {confirmUnsubscribe && active && (
        <div className="tdd-unsub-confirm">
          <p>Unsubscribe from every email? Or pick fewer lanes below instead.</p>
          <button type="button" className="tdd-cta" onClick={unsubscribe} disabled={leaving}>
            {leaving ? 'Unsubscribing' : 'Unsubscribe from everything'}
          </button>
        </div>
      )}
      <div className="tdd-news-form">
        <fieldset className="tdd-lanes">
          <legend>What do you want?</legend>
          <div>
            {LANES.map((lane) => (
              <label key={lane.key} className="tdd-lane-pick" data-family={lane.family}>
                <input type="checkbox" checked={lanes.includes(lane.key)} onChange={() => toggle(lane.key)} />
                <span>{lane.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" className="tdd-cta" onClick={save} disabled={status === 'saving' || lanes.length === 0}>
          {status === 'saving' ? 'Saving' : active ? 'Save' : 'Save and resubscribe'}
        </button>
        {lanes.length === 0 && <p className="tdd-form-error">Pick at least one lane.</p>}
        {status === 'saved' && (
          <p className="tdd-news-success" role="status"><Check size={20} strokeWidth={2.5} aria-hidden="true" />{message}</p>
        )}
        {status === 'error' && <p className="tdd-form-error" role="alert">{message}</p>}
        {active && !confirmUnsubscribe && status !== 'saved' && (
          <p className="tdd-news-fine">
            Want nothing at all?{' '}
            <button type="button" className="tdd-linklike" onClick={unsubscribe} disabled={leaving}>Unsubscribe from everything</button>.
          </p>
        )}
      </div>
    </div>
  )
}
