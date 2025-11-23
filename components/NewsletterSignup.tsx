'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'

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
        setMessage('Thanks for subscribing! Check your email to confirm.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="card max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-purple/20 mb-4">
          <Mail className="w-8 h-8 text-neon-purple" />
        </div>
        <h3 className="text-3xl font-bebas gradient-text mb-2">
          Stay in the Loop
        </h3>
        <p className="text-slate-muted">
          Get the latest Lakers news and TDD updates delivered daily.
        </p>
      </div>

      {status === 'success' ? (
        <div className="flex items-center justify-center space-x-2 text-neon-gold">
          <Check className="w-5 h-5" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 bg-slate-base border border-slate-muted/20 rounded-lg text-offwhite placeholder:text-slate-muted focus:outline-none focus:border-neon-purple transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-sm">{message}</p>
          )}

          <p className="text-xs text-slate-muted">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  )
}
