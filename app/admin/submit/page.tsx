'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { generateSlug } from '@/lib/slug'

export default function SubmitArticle() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    heroImageUrl: '',
    authorName: 'LNLS Sports Staff',
    authorBio: 'Covering the Lakers with passion and insight since day one.',
    authorTwitter: 'lnlssports',
    readTime: 5,
    topic: 'Lakers',
    body: '',
    videoUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const slug = generateSlug(formData.title)

      const bodyParagraphs = formData.body
        .split('\n\n')
        .filter((p) => p.trim())
        .map((paragraph) => {
          if (paragraph.startsWith('## ')) {
            return {
              type: 'heading',
              level: 2,
              text: paragraph.replace('## ', '').trim()
            }
          }

          return {
            type: 'paragraph',
            text: paragraph.trim()
          }
        })

      const response = await fetch('/api/articles/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
          body: bodyParagraphs
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit article')
      }

      setSuccess(true)
      setTimeout(() => router.push(`/news/${slug}`), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 font-netflix">Submit Article</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
          ✅ Article submitted successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
            required
          />
          {formData.title && (
            <p className="text-xs text-white/50 mt-1">
              Slug preview: <span className="font-mono">{generateSlug(formData.title)}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excerpt * (Short description)</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hero Image URL *</label>
          <input
            type="url"
            value={formData.heroImageUrl}
            onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
            required
          />
          <p className="text-xs text-white/40 mt-1">
            Recommended: 1200×675px. Use Unsplash, upload to Imgur, or use CDN
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Author Name *</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Twitter Handle (no @)</label>
            <input
              type="text"
              value={formData.authorTwitter}
              onChange={(e) => setFormData({ ...formData, authorTwitter: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Read Time (minutes) *</label>
            <input
              type="number"
              value={formData.readTime}
              onChange={(e) =>
                setFormData({ ...formData, readTime: Number.parseInt(e.target.value) || 0 })
              }
              min="1"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Topic *</label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
              required
            >
              <option value="Lakers">Lakers</option>
              <option value="NBA">NBA</option>
              <option value="Tech">Tech</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Article Body *</label>
          <p className="text-xs text-white/40 mb-2">Use ## for headings. Separate paragraphs with blank lines.</p>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={20}
            placeholder={`Write your article here...

## First Heading

Your first paragraph here.

Another paragraph here.

## Second Heading

More content...`}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Video URL (Optional)</label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[var(--netflix-red)] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[var(--netflix-red)] hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Article'}
        </button>
      </form>
    </div>
  )
}
