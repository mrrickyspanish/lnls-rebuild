'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/slug'
import type { Article } from '@/types/supabase'

interface ArticleFormProps {
  initialData?: Article
  mode: 'create' | 'edit'
}

export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    heroImageUrl: initialData?.hero_image_url || '',
    imageCredit: initialData?.image_credit || '',
    authorName: initialData?.author_name || 'TDD Sports Staff',
    authorBio: initialData?.author_bio || 'Covering the Lakers with passion and insight since day one.',
    authorTwitter: initialData?.author_twitter || 'lnlssports',
    readTime: initialData?.read_time || 5,
    topic: initialData?.topic || 'Lakers',
    body: initialData?.body 
      ? initialData.body.map(b => b.type === 'heading' ? `## ${b.text}` : b.text).join('\n\n')
      : '',
    videoUrl: initialData?.video_url || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
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

      const payload = {
        ...formData,
        body: bodyParagraphs
      }

      let response
      if (mode === 'create') {
        const slug = generateSlug(formData.title)
        response = await fetch('/api/articles/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, slug })
        })
      } else {
        // Edit mode
        if (!initialData?.slug) throw new Error('Missing slug for edit')
        response = await fetch(`/api/articles/${initialData.slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save article')
      }

      setSuccess(true)
      const targetSlug = mode === 'create' ? generateSlug(formData.title) : initialData?.slug
      setTimeout(() => router.push(`/news/${targetSlug}`), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save article'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 font-netflix">
        {mode === 'create' ? 'Submit Article' : 'Edit Article'}
      </h1>

      {success && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
          ✅ Article {mode === 'create' ? 'submitted' : 'updated'} successfully! Redirecting...
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
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excerpt *</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none h-24"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Hero Image URL
            </label>
            <input
              type="url"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Image Credit / Source
            </label>
            <input
              type="text"
              value={formData.imageCredit}
              onChange={(e) => setFormData({ ...formData, imageCredit: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
              placeholder="e.g. Getty Images / NBA Photos"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Author Name *</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Twitter Handle</label>
            <input
              type="text"
              value={formData.authorTwitter}
              onChange={(e) => setFormData({ ...formData, authorTwitter: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Read Time (mins)</label>
            <input
              type="number"
              value={formData.readTime}
              onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Author Bio</label>
          <input
            type="text"
            value={formData.authorBio}
            onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Topic</label>
          <select
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
          >
            <option value="Lakers">Lakers</option>
            <option value="NBA">NBA</option>
            <option value="Rumors">Rumors</option>
            <option value="Analysis">Analysis</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Article Body * (Use ## for headings, double enter for paragraphs)
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none h-96 font-mono"
            required
            placeholder="Write your article here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : (mode === 'create' ? 'Submit Article' : 'Update Article')}
        </button>
      </form>
    </div>
  )
}
