'use client'

import { useState, useRef, useCallback } from 'react'
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

const AUTHOR_PRESETS = [
  {
    name: 'TDD Sports Staff',
    twitter: 'lnlssports',
    bio: 'Covering the Lakers with passion and insight since day one.',
  },
  {
    name: 'Rick Barnes Jr.',
    twitter: '@mrrickyspanish',
    bio: 'Founder of The Daily Dribble & Creative Eye Studios. Digital creator and sports storyteller mixing hoops, culture, and life. Patiently persistent.',
  },
  {
    name: 'Juice McDaniels',
    twitter: '@LeKwamJames',
    bio: 'Klutch Sports Operative Passionately Covering the Lakers since 2019.',
  },
  {
    name: 'Brendan Willis',
    twitter: '@BwaysTakes',
    bio: 'Covering all things football with a bit of all other things sports related',
  },
]

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({})
  const [imageUsage, setImageUsage] = useState<'hero' | 'article'>('hero')
  const [articleImages, setArticleImages] = useState<string[]>([])
  const [insertArticleImage, setInsertArticleImage] = useState<((url: string, caption?: string) => void) | null>(null)
  const MAX_MB = 4

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    metaDescription: initialData?.meta_description || '',
    heroImageUrl: initialData?.hero_image_url || '',
    imageCredit: initialData?.image_credit || '',
    authorName: initialData?.author_name || 'TDD Sports Staff',
    authorBio: initialData?.author_bio || 'Covering the Lakers with passion and insight since day one.',
    authorTwitter: initialData?.author_twitter || 'lnlssports',
    readTime: initialData?.read_time || 5,
    topic: initialData?.topic || 'Lakers',
    videoUrl: initialData?.video_url || '',
    featured: initialData?.featured || false
  })

  const [rawText, setRawText] = useState('')
  const [isFormatting, setIsFormatting] = useState(false)
  const [showFormatter, setShowFormatter] = useState(false)

  const [bodyContent, setBodyContent] = useState<JSONContent>(
    toEditorContent(initialData?.body)
  )

  const handleBodyChange = (content: JSONContent) => setBodyContent(content)

  const handleEditorReady = useCallback(
    ({ insertImage }: { insertImage: (url: string, caption?: string) => void }) => {
      setInsertArticleImage(() => insertImage)
    },
    []
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, usage: 'hero' | 'article') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB}MB (current ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    setUploading(true)
    setUploadProgress({ ...uploadProgress, [usage]: true })

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      let data: any
      try {
        data = await response.json()
      } catch (parseErr) {
        const text = await response.text()
        throw new Error(text || 'Upload failed')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Update form with the new image path
      if (usage === 'hero') {
        setFormData(prev => ({
          ...prev,
          heroImageUrl: data.path,
        }))
      } else {
        setArticleImages(prev => [data.path, ...prev])
        const caption = window.prompt('Enter image caption (optional):')?.trim()
        insertArticleImage?.(data.path, caption)
      }

      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      setUploadProgress({ ...uploadProgress, [usage]: false })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
        featured: !!formData.featured
      }

      const targetSlug = mode === 'create'
        ? generateSlug(formData.title)
        : initialData?.slug

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

  const handleAutoFormat = async () => {
    if (!rawText.trim()) {
      setError('Please enter some text to format')
      return
    }

    setIsFormatting(true)
    setError('')

    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'format-article',
          content: rawText,
          context: {
            title: formData.title,
            category: formData.topic
          }
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to format article')
      }

      // Load the formatted JSON into the editor
      setBodyContent(result.data)
      setRawText('')
      setShowFormatter(false)
      setError('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to format article'
      setError(message)
    } finally {
      setIsFormatting(false)
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
                <div className="flex items-center gap-3 mb-4">
                  <input
                    id="featured-toggle"
                    type="checkbox"
                    checked={!!formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured-toggle" className="text-sm font-medium select-none cursor-pointer">
                    Pin as featured (show in homepage hero)
                  </label>
                </div>
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

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Images & Media</h2>
          
          <div className="space-y-3">
            <div className="flex gap-4 items-center text-sm text-neutral-400">
              <span className="font-semibold text-white">Upload intent:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="image-usage"
                  value="hero"
                  checked={imageUsage === 'hero'}
                  onChange={() => setImageUsage('hero')}
                  className="h-4 w-4 text-red-600 border-neutral-700 bg-neutral-900"
                />
                <span>Hero image</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="image-usage"
                  value="article"
                  checked={imageUsage === 'article'}
                  onChange={() => setImageUsage('article')}
                  className="h-4 w-4 text-red-600 border-neutral-700 bg-neutral-900"
                />
                <span>Article imagery</span>
              </label>
            </div>

            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Hero Image URL *
            </label>
            
            {/* File Upload */}
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, imageUsage)}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="w-full px-4 py-2 bg-neutral-800 border border-dashed border-neutral-700 rounded text-white text-center hover:border-red-600 transition-colors disabled:opacity-50 cursor-pointer">
                  {uploadProgress[imageUsage] ? 'Uploading...' : 'Click to upload'}
                </div>
              </label>
            </div>

            {/* Or paste URL */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-neutral-900 px-2 text-xs text-neutral-500">or paste URL</span>
              </div>
              <div className="border border-neutral-700 rounded"></div>
            </div>

            <input
              type="text"
              required
              value={formData.heroImageUrl}
              onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
              placeholder="https://cdn.example.com/image.jpg or /uploads/articles/local.jpg"
            />
            
            {formData.heroImageUrl && (
              <div className="mt-3 relative w-full h-40 bg-neutral-800 border border-neutral-700 rounded overflow-hidden">
                <img
                  src={formData.heroImageUrl}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Hero Video URL (optional)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
                placeholder="https://cdn.example.com/video.mp4"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Direct video files only (.mp4, .webm, .mov). Used on the article page hero only.
              </p>
              {formData.videoUrl && (
                <div className="mt-3 relative w-full h-40 bg-neutral-800 border border-neutral-700 rounded overflow-hidden">
                  <video
                    src={formData.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    controls
                  />
                </div>
              )}
            </div>

            {articleImages.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="text-sm text-neutral-400 font-semibold">Article imagery (recent uploads)</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {articleImages.map((img) => (
                    <div key={img} className="p-3 bg-neutral-800 border border-neutral-700 rounded space-y-2">
                      <div className="text-xs text-neutral-500 break-all">{img}</div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(img)}
                          className="px-3 py-1 bg-neutral-700 text-white text-sm rounded hover:bg-neutral-600 transition-colors"
                        >
                          Copy URL
                        </button>
                        <a
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded hover:bg-red-600/30 transition-colors"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-500">Paste these URLs into the article body where you need supporting images.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">
              Meta Description (SEO)
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-600"
              placeholder="Custom description for search engines and social media (optional, defaults to excerpt)"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-neutral-500 mt-1">{formData.metaDescription.length}/160 characters</p>
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
            <label className="block text-sm font-medium mb-2">Author *</label>
            <select
              value={formData.authorName}
              onChange={(e) => {
                const selected = AUTHOR_PRESETS.find(a => a.name === e.target.value)
                if (selected) {
                  setFormData({
                    ...formData,
                    authorName: selected.name,
                    authorTwitter: selected.twitter,
                    authorBio: selected.bio,
                  })
                }
              }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 focus:border-red-600 focus:outline-none"
              required
            >
              <option value="">Select an author...</option>
              {AUTHOR_PRESETS.map((author) => (
                <option key={author.name} value={author.name}>
                  {author.name}
                </option>
              ))}
            </select>
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


        <div className="flex items-center gap-3 mb-4">
          <input
            id="featured-toggle"
            type="checkbox"
            checked={!!formData.featured}
            onChange={e => setFormData({ ...formData, featured: e.target.checked })}
            className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="featured-toggle" className="text-sm font-medium select-none cursor-pointer">
            Pin as featured (show in homepage hero)
          </label>
        </div>

            <div className="flex items-center gap-3 mb-4">
              <input
                id="featured-toggle"
                type="checkbox"
                checked={!!formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="featured-toggle" className="text-sm font-medium select-none cursor-pointer">
                Pin as featured (show in homepage hero)
              </label>
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
            <option value="FEATURED">FEATURED</option>
            <option value="Recruit Ready">Recruit Ready</option>
            <option value="Lakers">Lakers</option>
            <option value="NBA">NBA</option>
            <option value="Football">Football</option>
            <option value="Rumors">Rumors</option>
            <option value="Analysis">Analysis</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>
        </div>

        {/* AI Auto-Format Section */}
        <div className="space-y-2 border border-neutral-700 rounded-lg p-4 bg-neutral-900/50">
          <button
            type="button"
            onClick={() => setShowFormatter(!showFormatter)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-white">🤖 AI Auto-Format</h3>
              <p className="text-xs text-neutral-400 mt-1">Paste raw text and let AI structure it with headings, emphasis, and callouts</p>
            </div>
            <span className="text-neutral-500">{showFormatter ? '▼' : '▶'}</span>
          </button>

          {showFormatter && (
            <div className="mt-4 space-y-3">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your raw article text here... AI will add headings, bold key phrases, create callouts for important points, and structure it beautifully."
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white focus:outline-none focus:border-orange-500 h-48 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAutoFormat}
                  disabled={isFormatting || !rawText.trim()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isFormatting ? 'Formatting...' : '✨ Format with AI'}
                </button>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded transition-colors text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                💡 Tip: Add a title first for better AI formatting. The formatted content will load into the editor below where you can review and edit.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2">
            Article Body *
          </label>
          <RichTextEditor 
            value={bodyContent} 
            onChange={handleBodyChange}
            onReady={handleEditorReady}
          />
          <p className="text-xs text-neutral-500">
            Use the toolbar to add formatting, links, images/GIFs, and embedded YouTube or Vimeo videos.
          </p>
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
