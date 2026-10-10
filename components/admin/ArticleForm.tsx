'use client'
import { SITE_OWNER, isSiteOwner } from '@/lib/author'
import { NOTE_KINDS, PIECE_TYPES } from '@/lib/articles/piece-type'
import { ARTICLE_TOPICS, isArticleTopic } from '@/lib/topics'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/react'

import RichTextEditor from '@/components/admin/RichTextEditor'
import AiFormatSheet, { type AiFormatResult } from '@/components/admin/editor/AiFormatSheet'
import { countMedia, docToPlainText } from '@/lib/articles/plain-text'
import { blocksToTipTapDoc, isArticleBodyBlocks, isTipTapDoc } from '@/lib/articles/body'
import { attachLegacyCaptions } from '@/lib/articles/captions'
import { generateSlug } from '@/lib/slug'
import type { Article } from '@/types/supabase'

interface ArticleFormProps {
  initialData?: Article
  mode: 'create' | 'edit'
}

/**
 * The site has one writer, so new stories are bylined to the owner
 * (lib/author.ts). An older story keeps its original byline as a second
 * choice, so opening it to fix a typo doesn't change who wrote it.
 */
function bylineChoices(initialData?: Article) {
  const owner = { name: SITE_OWNER.name, twitter: SITE_OWNER.twitter as string, bio: SITE_OWNER.bio as string }
  if (!initialData?.author_name || isSiteOwner(initialData.author_name)) return [owner]
  return [
    owner,
    {
      name: initialData.author_name,
      twitter: initialData.author_twitter || '',
      bio: initialData.author_bio || '',
    },
  ]
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

// Shared field styles. 16px text keeps iOS Safari from zooming into a field
// when it's tapped; 48px height is a comfortable thumb target.
const FIELD = 'w-full min-h-[48px] bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-base text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none'
const LABEL = 'block text-sm font-semibold text-neutral-200 mb-1.5'
const HINT = 'mt-1.5 text-sm text-neutral-400'
const SECTION = 'space-y-5 border-t border-neutral-800 pt-8'
const SECTION_TITLE = 'text-xl font-bold text-white'
const DISCLOSURE = 'rounded-lg border border-neutral-800 bg-neutral-950 [&_summary::-webkit-details-marker]:hidden'
const DISCLOSURE_SUMMARY = 'flex min-h-[52px] cursor-pointer items-center justify-between gap-3 px-4 py-3 text-base font-semibold text-neutral-100'

/**
 * Laid out in the order a story gets written, on a phone as much as a
 * laptop: the story first (headline, summary, topic, body), then the cover
 * image, the byline, and publishing settings, with rarely changed fields
 * folded away. A pinned bar keeps Save one tap away at any scroll position;
 * it used to sit at the very bottom, below the entire article, after about
 * sixteen metadata fields that came before the body.
 */
export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const MAX_MB = 4
  const isDraft = mode === 'edit' && initialData?.published === false

  // The editor's toolbar pins just below the Save bar, whose height changes
  // when a message shows, so publish its height as --save-bar-h.
  const formRef = useRef<HTMLFormElement | null>(null)
  const saveBarRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const bar = saveBarRef.current
    const form = formRef.current
    if (!bar || !form) return
    const update = () => form.style.setProperty('--save-bar-h', `${bar.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    metaDescription: initialData?.meta_description || '',
    heroImageUrl: initialData?.hero_image_url || '',
    imageCredit: initialData?.image_credit || '',
    authorName: initialData?.author_name || SITE_OWNER.name,
    authorBio: initialData?.author_name ? initialData.author_bio || '' : SITE_OWNER.bio,
    authorTwitter: initialData?.author_name ? initialData.author_twitter || '' : SITE_OWNER.twitter,
    readTime: initialData?.read_time || 5,
    topic: initialData?.topic || 'Lakers',
    videoUrl: initialData?.video_url || '',
    featured: initialData?.featured || false,
    // Older stories have no label until one is picked; saving requires one.
    pieceType: (initialData?.article_type as string | null | undefined) || '',
    rumorSource: initialData?.rumor_source || '',
    noteKind: (initialData?.note_kind as string | null | undefined) || 'update',
    noteText: initialData?.note_text || '',
  })
  const authorChoices = bylineChoices(initialData)

  const [aiOpen, setAiOpen] = useState(false)

  const [bodyContent, setBodyContent] = useState<JSONContent>(
    toEditorContent(initialData?.body)
  )

  const handleBodyChange = (content: JSONContent) => setBodyContent(content)

  // Cover image only. Images inside the story go through the editor's own
  // image button, which also asks for a caption and width.
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB}MB (current ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      return
    }

    setUploading(true)

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

      setFormData(prev => ({ ...prev, heroImageUrl: data.path }))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
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

      if (!formData.pieceType) {
        setError('Pick a label: Opinion, Analysis, Report or Rumor.')
        document.getElementById('piece-type')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
      // A draft has no public page (it 404s), so a saved draft goes back to
      // the article list instead.
      setTimeout(() => router.push(isDraft ? '/admin' : `/news/${targetSlug}`), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save article'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // AI Auto-Format (components/admin/editor/AiFormatSheet.tsx). The writer
  // has already reviewed and chosen everything in `result`; nothing is saved
  // until the article is.
  const applyAiFormat = (result: AiFormatResult) => {
    setBodyContent(result.doc)
    setFormData((prev) => ({
      ...prev,
      title: result.headline ?? prev.title,
      excerpt: result.summary ?? prev.excerpt,
      metaDescription: result.metaDescription ?? prev.metaDescription,
      readTime: result.readTime ?? prev.readTime,
    }))
    setAiOpen(false)
    setError('')
  }

  const saveLabel = loading
    ? 'Saving…'
    : mode === 'create'
      ? 'Publish'
      : isDraft
        ? 'Save draft'
        : 'Save'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
      {/* Pinned action bar: back, what you're editing, Save. Messages show
          here so they're seen wherever the writer has scrolled to. */}
      <div ref={saveBarRef} className="sticky top-0 z-30 -mx-4 sm:-mx-6 mb-6 border-b border-neutral-800 bg-black/95 px-4 sm:px-6 py-2 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex min-h-[44px] items-center text-base text-neutral-300 hover:text-white" aria-label="Back to articles">
            ← <span className="ml-1 hidden sm:inline">Articles</span>
          </Link>
          <p className="min-w-0 flex-1 truncate text-base font-semibold">
            {mode === 'create' ? 'New article' : formData.title || 'Edit article'}
            {isDraft && <span className="ml-2 rounded-full bg-yellow-900/40 px-2 py-0.5 text-sm font-medium text-yellow-300">Draft</span>}
          </p>
          <button
            type="submit"
            disabled={loading || success}
            className="min-h-[44px] shrink-0 rounded bg-red-600 px-5 text-base font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saveLabel}
          </button>
        </div>
        {success && (
          <p className="mt-2 rounded bg-green-900/30 px-3 py-2 text-sm text-green-300" role="status">
            {mode === 'create' ? 'Published.' : 'Saved.'} {isDraft ? 'Taking you back to your articles…' : 'Opening the article…'}
          </p>
        )}
        {error && (
          <p className="mt-2 rounded bg-red-900/30 px-3 py-2 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* ---------- The story ---------- */}
      <section className="space-y-5" aria-labelledby="story-heading">
        <h1 id="story-heading" className="sr-only">{mode === 'create' ? 'New article' : 'Edit article'}</h1>

        {/* Stories usually start as a draft written elsewhere, so pasting
            one in is the first thing on the page. The same sheet opens
            from the ✨ AI button in the editor toolbar. */}
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="flex w-full min-h-[64px] items-center gap-4 rounded-lg border border-orange-500/50 bg-orange-500/10 px-4 py-3 text-left hover:border-orange-400"
        >
          <span className="text-2xl" aria-hidden="true">✨</span>
          <span className="flex-1">
            <span className="block text-base font-bold text-white">Paste &amp; format with AI</span>
            <span className="mt-0.5 block text-sm text-neutral-300">
              Formats your draft, fixes typos, and suggests a headline, summary and search description. You review it all first.
            </span>
          </span>
        </button>

        <div>
          <label htmlFor="article-title" className={LABEL}>Headline</label>
          <textarea
            id="article-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value.replace(/\n/g, ' ') })}
            className={`${FIELD} resize-none text-xl font-bold leading-snug`}
            rows={2}
            placeholder="What's the story?"
            required
          />
        </div>

        <div>
          <label htmlFor="article-excerpt" className={LABEL}>Summary</label>
          <textarea
            id="article-excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className={`${FIELD} h-28`}
            placeholder="One or two sentences. Shown under the headline and in link previews."
            required
          />
        </div>

        <div>
          <label htmlFor="article-topic" className={LABEL}>Topic</label>
          <select
            id="article-topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className={FIELD}
          >
            {ARTICLE_TOPICS.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
            {/* A retired topic (e.g. "Rumors") stays selectable on the story
                that has it, so opening it doesn't silently change it. */}
            {initialData?.topic && !isArticleTopic(initialData.topic) && (
              <option value={initialData.topic}>{initialData.topic} (retired, pick a new topic)</option>
            )}
          </select>
        </div>

        {/* The label readers see on the story and its cards. /standards
            explains each one. Required, but checked on save rather than with
            the browser's own `required`, whose bubble would point at a
            visually hidden radio. */}
        <fieldset id="piece-type" className="scroll-mt-32">
          <legend className={LABEL}>Label</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PIECE_TYPES.map((type) => {
              const checked = formData.pieceType === type.value
              return (
                <label
                  key={type.value}
                  className={`flex min-h-[64px] cursor-pointer flex-col justify-center rounded border px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-red-500 ${
                    checked ? 'border-red-500 bg-red-600/15' : 'border-neutral-700 bg-neutral-900 hover:border-neutral-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="piece-type"
                    value={type.value}
                    checked={checked}
                    onChange={() => setFormData({ ...formData, pieceType: type.value })}
                    className="sr-only"
                  />
                  <span className="text-base font-bold text-white">{type.label}</span>
                  <span className="mt-0.5 text-sm leading-snug text-neutral-400">{type.editorHint}</span>
                </label>
              )
            })}
          </div>
          {!formData.pieceType && mode === 'edit' && (
            <p className={HINT}>This story doesn&apos;t have a label yet. Pick one to save it.</p>
          )}
        </fieldset>

        {formData.pieceType === 'rumor' && (
          <div>
            <label htmlFor="rumor-source" className={LABEL}>Who&apos;s reporting it?</label>
            <input
              id="rumor-source"
              type="text"
              value={formData.rumorSource}
              onChange={(e) => setFormData({ ...formData, rumorSource: e.target.value })}
              className={FIELD}
              placeholder="e.g. Shams Charania, ESPN"
              required
            />
            <p className={HINT}>Shown at the top of the story: who reported it and that it isn&apos;t confirmed.</p>
          </div>
        )}

        <div>
          <p className={LABEL} id="body-label">Story</p>
          <RichTextEditor
            value={bodyContent}
            onChange={handleBodyChange}
            topic={formData.topic}
            onAiFormat={() => setAiOpen(true)}
          />
          <p className={HINT}>
            The editor previews the published page. Tap an image, stat block or table to get its edit buttons.
          </p>
        </div>
      </section>

      {/* ---------- Cover image ---------- */}
      <section className={`${SECTION} mt-10`} aria-labelledby="cover-heading">
        <h2 id="cover-heading" className={SECTION_TITLE}>Cover image</h2>

        <div>
          <input
            ref={fileInputRef}
            id="hero-upload"
            type="file"
            accept="image/*"
            onChange={handleHeroUpload}
            disabled={uploading}
            className="sr-only"
          />
          <label
            htmlFor="hero-upload"
            className="flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded border border-dashed border-neutral-600 bg-neutral-900 px-4 text-base font-semibold text-white hover:border-red-500"
          >
            {uploading ? 'Uploading…' : formData.heroImageUrl ? 'Replace cover image' : 'Upload cover image'}
          </label>
          <p className={HINT}>JPG, PNG or WebP, under {MAX_MB}MB.</p>
        </div>

        {formData.heroImageUrl && (
          <img
            src={formData.heroImageUrl}
            alt="Cover preview"
            className="w-full max-h-72 rounded border border-neutral-800 object-contain bg-neutral-900"
          />
        )}

        <div>
          <label htmlFor="hero-url" className={LABEL}>Or paste an image address</label>
          <input
            id="hero-url"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            required
            value={formData.heroImageUrl}
            onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
            className={FIELD}
            placeholder="https://… or /uploads/articles/…"
          />
        </div>

        <div>
          <label htmlFor="hero-credit" className={LABEL}>Photo credit</label>
          <input
            id="hero-credit"
            type="text"
            value={formData.imageCredit}
            onChange={(e) => setFormData({ ...formData, imageCredit: e.target.value })}
            className={FIELD}
            placeholder="e.g. Getty Images / NBA Photos"
          />
        </div>

        <details className={DISCLOSURE}>
          <summary className={DISCLOSURE_SUMMARY}>
            <span>Cover video <span className="font-normal text-neutral-400">(optional)</span></span>
            <span className="text-neutral-500" aria-hidden="true">▼</span>
          </summary>
          <div className="space-y-3 px-4 pb-4">
            <label htmlFor="hero-video" className="sr-only">Cover video address</label>
            <input
              id="hero-video"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className={FIELD}
              placeholder="https://cdn.example.com/video.mp4"
            />
            <p className={HINT}>Direct video files only (.mp4, .webm, .mov). Plays in place of the cover image.</p>
            {formData.videoUrl && (
              <video src={formData.videoUrl} className="w-full max-h-60 rounded bg-neutral-900" muted playsInline controls />
            )}
          </div>
        </details>
      </section>

      {/* ---------- Byline ---------- */}
      <section className={`${SECTION} mt-10`} aria-labelledby="byline-heading">
        <h2 id="byline-heading" className={SECTION_TITLE}>Byline</h2>
        <div>
          <label htmlFor="article-author" className={LABEL}>Author</label>
          <select
            id="article-author"
            value={formData.authorName}
            onChange={(e) => {
              const selected = authorChoices.find(a => a.name === e.target.value)
              if (selected) {
                setFormData({
                  ...formData,
                  authorName: selected.name,
                  authorTwitter: selected.twitter,
                  authorBio: selected.bio,
                })
              }
            }}
            className={FIELD}
            required
          >
            {authorChoices.map((author, i) => (
              <option key={author.name} value={author.name}>
                {i === 0 ? author.name : `${author.name} (original byline)`}
              </option>
            ))}
          </select>
          {authorChoices.length > 1 && (
            <p className={HINT}>Older story: it keeps its original byline unless you switch it to yours.</p>
          )}
        </div>

        <details className={DISCLOSURE}>
          <summary className={DISCLOSURE_SUMMARY}>
            <span>Handle and bio</span>
            <span className="text-neutral-500" aria-hidden="true">▼</span>
          </summary>
          <div className="space-y-4 px-4 pb-4">
            <div>
              <label htmlFor="author-twitter" className={LABEL}>X handle</label>
              <input
                id="author-twitter"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={formData.authorTwitter}
                onChange={(e) => setFormData({ ...formData, authorTwitter: e.target.value })}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="author-bio" className={LABEL}>Bio</label>
              <textarea
                id="author-bio"
                value={formData.authorBio}
                onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                className={`${FIELD} h-24`}
              />
            </div>
          </div>
        </details>
      </section>

      {/* ---------- Update or correction ---------- */}
      {mode === 'edit' && (
        <section className={`${SECTION} mt-10`} aria-labelledby="note-heading">
          <div>
            <h2 id="note-heading" className={SECTION_TITLE}>Update or correction</h2>
            <p className={HINT}>
              Shows at the top of the story, dated the day you save it. Use Update for new information and Correction when something in the story was wrong. Clear the text to remove it.
            </p>
          </div>

          <fieldset>
            <legend className="sr-only">Note type</legend>
            <div className="grid grid-cols-2 gap-2">
              {NOTE_KINDS.map((kind) => {
                const checked = formData.noteKind === kind.value
                return (
                  <label
                    key={kind.value}
                    className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded border px-3 text-base font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-red-500 ${
                      checked ? 'border-red-500 bg-red-600/15 text-white' : 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="note-kind"
                      value={kind.value}
                      checked={checked}
                      onChange={() => setFormData({ ...formData, noteKind: kind.value })}
                      className="sr-only"
                    />
                    {kind.label}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="note-text" className="sr-only">Note</label>
            <textarea
              id="note-text"
              value={formData.noteText}
              onChange={(e) => setFormData({ ...formData, noteText: e.target.value })}
              className={`${FIELD} h-28`}
              placeholder={formData.noteKind === 'correction'
                ? 'e.g. An earlier version said the deal was for three years. It’s four.'
                : 'e.g. The Lakers confirmed the trade Tuesday night.'}
            />
            {initialData?.note_at && formData.noteText.trim() && (
              <p className={HINT}>
                Current note dated {new Date(initialData.note_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Changing it re-dates it.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ---------- Publishing ---------- */}
      <section className={`${SECTION} mt-10`} aria-labelledby="publishing-heading">
        <h2 id="publishing-heading" className={SECTION_TITLE}>Publishing</h2>

        <label htmlFor="featured-toggle" className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded border border-neutral-800 bg-neutral-950 px-4">
          <input
            id="featured-toggle"
            type="checkbox"
            checked={!!formData.featured}
            onChange={e => setFormData({ ...formData, featured: e.target.checked })}
            className="h-5 w-5 shrink-0 accent-red-600"
          />
          <span className="text-base">Pin as featured <span className="text-neutral-400">(home page cover story)</span></span>
        </label>

        <div>
          <label htmlFor="read-time" className={LABEL}>Read time (minutes)</label>
          <input
            id="read-time"
            type="number"
            inputMode="numeric"
            value={formData.readTime}
            onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
            className={`${FIELD} max-w-[10rem]`}
            min="1"
          />
        </div>

        <details className={DISCLOSURE}>
          <summary className={DISCLOSURE_SUMMARY}>
            <span>Search and social description <span className="font-normal text-neutral-400">(optional)</span></span>
            <span className="text-neutral-500" aria-hidden="true">▼</span>
          </summary>
          <div className="px-4 pb-4">
            <label htmlFor="meta-description" className="sr-only">Search and social description</label>
            <textarea
              id="meta-description"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className={`${FIELD} h-24`}
              placeholder="Leave blank to use the summary."
              maxLength={160}
            />
            <p className={HINT}>{formData.metaDescription.length}/160 characters</p>
          </div>
        </details>
      </section>

      {aiOpen && (
        <AiFormatSheet
          editorText={docToPlainText(bodyContent)}
          editorMediaCount={countMedia(bodyContent)}
          current={{
            title: formData.title,
            summary: formData.excerpt,
            metaDescription: formData.metaDescription,
            topic: formData.topic,
          }}
          onClose={() => setAiOpen(false)}
          onApply={applyAiFormat}
        />
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="mt-10 w-full min-h-[52px] rounded bg-red-600 text-base font-bold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </form>
  )
}

function toEditorContent(body?: Article['body']): JSONContent {
  if (!body) return EMPTY_DOC
  // Upgrade old-style caption paragraphs so they edit as real captions.
  if (isTipTapDoc(body)) return attachLegacyCaptions(body as JSONContent)
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
