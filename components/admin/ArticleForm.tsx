'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/react'

import RichTextEditor from '@/components/admin/RichTextEditor'
import { blocksToTipTapDoc, isArticleBodyBlocks, isTipTapDoc } from '@/lib/articles/body'
import { generateSlug } from '@/lib/slug'
import type { Article } from '@/types/supabase'

interface ArticleFormProps {
  initialData?: Article
  mode: 'create' | 'edit'
}

const EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
  ],
}

export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  error, setError] = useState('')
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
    videoUrl: initialData?.video_url || ''
  })

  const [slideshow, setSlideshow] = useState({
    title: initialData?.slideshow?.title || '',
    slides: initialData?.slideshow?.slides || []
  })

  const [bodyContent, setBodyContent] = useState<JSONContent>(
    toEditorContent(initialData?.body)
  )

  const handleBodyChange = (content: JSONContent) => setBodyContent(content)

  const addSlide = () => {
    setSlideshow({
      ...slideshow,
      slides: [...slideshow.slides, {
        image_url: '',
        caption: '',
        description: ''
      }]
    })
  }

  const removeSlide = (index: number) => {
    setSlideshow({
      ...slideshow,
      slides: slideshow.slides.filter((_, i) => i !== index)
    })
  }

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slideshow.slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlideshow({ ...slideshow, slides: newSlides })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!hasEditorContent(bodyContent)) {
        setError('Article body is required')
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        body: bodyContent,
        slideshow: slideshow.slides.length > 0 ? slideshow : null
      }

      const targetSlug = mode === 'create'
        ? generateSlug(formData.title)
        : initialData?.slug

      if (!targetSlug) {
        throw new Error('Missing slug for article action')
      }

      let response
      if (mode === 'create') {
        response = await fetch('/api/articles/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, slug: targetSlug })
        })
      } else {
        response = await fetch(`/api/articles/${targetSlug}`, {
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
              Hero Image Source
            </label>
            <input
              type="text"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
              placeholder="https://cdn.example.com/image.jpg or /uploads/articles/local.jpg"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Accepts full URLs or repo assets served from <code>/public</code> (e.g. /uploads/articles/cover.jpg).
            </p>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2">
            Article Body *
          </label>
          <RichTextEditor value={bodyContent} onChange={handleBodyChange} />
          <p className="text-xs text-neutral-500">
            Use the toolbar to add formatting, links, images/GIFs, and embedded YouTube or Vimeo videos.
          </p>
        </div>

        {/* Slideshow Section */}
        <div className="space-y-4 border-t border-neutral-800 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Photo Slideshow (Optional)</h3>
            <button
              type="button"
              onClick={addSlide}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition-colors"
            >
              + Add Slide
            </button>
          </div>

          {slideshow.slides.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Slideshow Title
                </label>
                <input
                  type="text"
                  value={slideshow.title}
                  onChange={(e) => setSlideshow({ ...slideshow, title: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  placeholder="e.g., Game Highlights, Top Plays, Behind the Scenes"
                />
              </div>

              <div className="space-y-4">
                {slideshow.slides.map((slide, index) => (
                  <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Slide {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeSlide(index)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Image URL *</label>
                      <input
                        type="url"
                        value={slide.image_url}
                        onChange={(e) => updateSlide(index, 'image_url', e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-600"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Caption *</label>
                      <input
                        type="text"
                        value={slide.caption}
                        onChange={(e) => updateSlide(index, 'caption', e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-600"
                        placeholder="Main caption for this slide"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Description (Optional)</label>
                      <textarea
                        value={slide.description}
                        onChange={(e) => updateSlide(index, 'description', e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-600"
                        placeholder="Additional details about this slide"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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

function toEditorContent(body?: Article['body']): JSONContent {
  if (!body) return EMPTY_DOC
  if (isTipTapDoc(body)) return body as JSONContent
  if (isArticleBodyBlocks(body)) return blocksToTipTapDoc(body)
  return EMPTY_DOC
}

function hasEditorContent(doc: JSONContent | null): boolean {
  if (!doc || !Array.isArray(doc.content)) return false
  return doc.content.some(node => nodeHasContent(node))
}

function nodeHasContent(node?: JSONContent): boolean {
  if (!node) return false
  if (!node.type) {
    if (Array.isArray(node.content)) {
      return node.content.some(child => nodeHasContent(child))
    }
    return false
  }
  if (node.type === 'text') {
    return typeof node.text === 'string' && node.text.trim().length > 0
  }
  if (node.type === 'image' && node.attrs?.src) return true
  if (node.type === 'videoEmbed' && node.attrs?.src) return true
  if (Array.isArray(node.content)) {
    return node.content.some(child => nodeHasContent(child))
  }
  return false
}
