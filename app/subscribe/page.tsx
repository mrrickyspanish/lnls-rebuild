'use client';

import { useState } from 'react';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing! Check your email for a welcome message.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-[30px] md:pt-[180px] pb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 font-netflix">
        Subscribe
      </h1>
      <p className="text-xl text-white/80 mb-8">
        Never miss a dribble... sports, tech, culture, all unfiltered and to the point.
      </p>

      {/* Newsletter Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Newsletter</h2>
        <p className="text-white/60 mb-6">
          Weekly drops on what's worth talking about... sports, culture, tech, curated and straight to the point.
        </p>

        {status === 'success' ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
            <p className="text-center font-semibold">You're in... check your email, we'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-[var(--netflix-red)] focus:outline-none disabled:opacity-50"
            />

            {status === 'error' && (
              <p className="text-red-400 text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="w-full py-3 bg-[var(--netflix-red)] hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>

            <p className="text-xs text-white/50 text-center">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>

      {/* Podcast Links */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Late Night Lake Show</h2>
        <p className="text-white/60 mb-6">
          Lakers talk, uncut... listen wherever you get your podcasts:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            Apple Podcasts
          </a>
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            Spotify
          </a>
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            Google Podcasts
          </a>
          <a
            href="#"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-center rounded-lg transition-colors"
          >
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
