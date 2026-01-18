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
    <div className="text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--netflix-red)]/20 mb-4">
          <Mail className="w-7 h-7 text-[var(--netflix-red)]" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-netflix">
          Never Miss a Dribble
        </h3>
        <p className="text-white/60 text-sm md:text-base">
          Get the latest Lakers news, culture, and tech insights delivered daily.
        </p>
      </div>

      {status === 'success' ? (
        <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg py-4 px-6">
          <Check className="w-5 h-5" />
          <span className="font-semibold">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--netflix-red)] transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-[var(--netflix-red)] hover:bg-red-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-sm">{message}</p>
          )}

          <p className="text-xs text-white/40">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  )
}
