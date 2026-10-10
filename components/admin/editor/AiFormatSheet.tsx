"use client"

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { JSONContent } from '@tiptap/core'

import ArticleBody from '@/components/article/ArticleBody'
import { topicFamily } from '@/lib/topics'

type Suggestions = {
  headlines: string[]
  summary: string | null
  metaDescription: string | null
  readTime: number
}

export type AiFormatResult = {
  doc: JSONContent
  headline?: string
  summary?: string
  metaDescription?: string
  readTime?: number
}

type AiFormatSheetProps = {
  /** Plain text of what's in the editor now, offered as a starting point. */
  editorText: string
  /** Images, videos and posts in the current story; Apply replaces them. */
  editorMediaCount: number
  current: { title: string; summary: string; metaDescription: string; topic: string }
  onClose: () => void
  onApply: (result: AiFormatResult) => void
}

type Step = 'paste' | 'working' | 'review'

const KEEP = '__keep__'
const FIELD = 'w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-base text-white placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none'
const BUTTON = 'min-h-[48px] rounded px-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50'

/**
 * AI Auto-Format as a full-screen sheet on phones (a large panel on desktop):
 * paste a draft, let the AI structure it, fix typos and suggest a headline,
 * summary and search description, then review all of it before anything in
 * the article changes. Apply or Discard; nothing is saved until the article
 * itself is saved.
 *
 * Portaled to <body> because it opens from inside the article <form>; its
 * buttons are type="button" so none of them submit the article.
 */
export default function AiFormatSheet({ editorText, editorMediaCount, current, onClose, onApply }: AiFormatSheetProps) {
  const [step, setStep] = useState<Step>('paste')
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [doc, setDoc] = useState<JSONContent | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null)
  const [canReadClipboard, setCanReadClipboard] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const pasteRef = useRef<HTMLTextAreaElement>(null)

  // Review choices
  const [headlineChoice, setHeadlineChoice] = useState<string>(KEEP)
  const [summary, setSummary] = useState('')
  const [useSummary, setUseSummary] = useState(false)
  const [metaDescription, setMetaDescription] = useState('')
  const [useMeta, setUseMeta] = useState(false)
  const [useReadTime, setUseReadTime] = useState(true)

  useEffect(() => {
    setCanReadClipboard(typeof navigator !== 'undefined' && !!navigator.clipboard?.readText)
    pasteRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    // Keep the page behind from scrolling under the sheet.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      abortRef.current?.abort()
    }
  }, [])

  const close = () => {
    abortRef.current?.abort()
    onClose()
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setRaw(text)
    } catch {
      setError('Couldn’t read the clipboard. Press and hold in the box below and choose Paste.')
    }
  }

  const format = async () => {
    const text = raw.trim()
    if (!text) return
    setError('')
    setStep('working')
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'format-article', content: text, context: { title: current.title, category: current.topic } }),
        signal: controller.signal,
      })
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'The AI couldn’t format this. Try again.')
      const data = result.data
      if (!data?.doc || data.doc.type !== 'doc') throw new Error('The AI returned something unusable. Try again.')

      const s: Suggestions = data.suggestions ?? { headlines: [], summary: null, metaDescription: null, readTime: 0 }
      setDoc(data.doc)
      setSuggestions(s)
      // Fields the writer already filled in stay theirs unless they opt in.
      setHeadlineChoice(current.title.trim() || !s.headlines[0] ? KEEP : s.headlines[0])
      setSummary(s.summary ?? '')
      setUseSummary(Boolean(s.summary) && !current.summary.trim())
      setMetaDescription(s.metaDescription ?? '')
      setUseMeta(Boolean(s.metaDescription) && !current.metaDescription.trim())
      setUseReadTime(s.readTime > 0)
      setStep('review')
    } catch (err) {
      if (controller.signal.aborted) return
      setError(err instanceof Error ? err.message : 'The AI couldn’t format this. Try again.')
      setStep('paste')
    }
  }

  const apply = () => {
    if (!doc || !suggestions) return
    onApply({
      doc,
      headline: headlineChoice !== KEEP ? headlineChoice : undefined,
      summary: useSummary && summary.trim() ? summary.trim() : undefined,
      metaDescription: useMeta && metaDescription.trim() ? metaDescription.trim() : undefined,
      readTime: useReadTime && suggestions.readTime > 0 ? suggestions.readTime : undefined,
    })
  }

  const wordCount = raw.trim() ? raw.trim().split(/\s+/).length : 0

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/80 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-sheet-title"
        className="flex h-[100dvh] w-full flex-col bg-neutral-900 sm:h-[90dvh] sm:max-w-3xl sm:rounded-lg sm:border sm:border-neutral-700"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-2">
          <h2 id="ai-sheet-title" className="flex-1 text-lg font-bold text-white">
            {step === 'review' ? 'Review the AI’s version' : '✨ Format with AI'}
          </h2>
          <button type="button" onClick={close} className="min-h-[44px] min-w-[44px] rounded text-2xl text-neutral-300 hover:text-white" aria-label="Close">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {step === 'paste' && (
            <div className="space-y-4">
              <p className="text-base text-neutral-300">
                Paste your draft. The AI adds headings, quotes, stats and takeaways, fixes typos, and suggests a
                headline, summary and search description. Quotes, names and numbers stay exactly as written, and you
                review everything before it’s used.
              </p>

              <div className="flex flex-wrap gap-2">
                {canReadClipboard && (
                  <button type="button" onClick={pasteFromClipboard} className={`${BUTTON} bg-neutral-700 text-white hover:bg-neutral-600`}>
                    📋 Paste from clipboard
                  </button>
                )}
                {editorText.trim() && (
                  <button type="button" onClick={() => setRaw(editorText)} className={`${BUTTON} border border-neutral-700 text-neutral-200 hover:border-neutral-500`}>
                    Use the story in the editor
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="ai-raw" className="mb-1.5 block text-sm font-semibold text-neutral-200">Your draft</label>
                <textarea
                  id="ai-raw"
                  ref={pasteRef}
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  className={`${FIELD} h-[45dvh] min-h-[220px]`}
                  placeholder="Paste or type the story here…"
                />
                <p className="mt-1.5 text-sm text-neutral-400">{wordCount ? `${wordCount.toLocaleString()} words` : 'Add the headline first if you have one; the AI uses it.'}</p>
              </div>

              {error && <p className="rounded bg-red-900/30 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>}
            </div>
          )}

          {step === 'working' && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center" role="status">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-orange-500" aria-hidden="true" />
              <p className="text-lg font-semibold text-white">Formatting your story…</p>
              <p className="max-w-sm text-base text-neutral-400">Long stories can take a minute. Keep this open; nothing in your article changes until you apply it.</p>
            </div>
          )}

          {step === 'review' && doc && suggestions && (
            <div className="space-y-6">
              {editorMediaCount > 0 && (
                <p className="rounded border border-yellow-700/60 bg-yellow-900/20 px-3 py-2 text-sm text-yellow-200">
                  Apply replaces the story in the editor, including its {editorMediaCount} {editorMediaCount === 1 ? 'image or embed' : 'images and embeds'}. Add them back afterwards, or Discard to keep the current story.
                </p>
              )}

              {/* Headline */}
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-neutral-200">Headline</legend>
                <div className="space-y-2">
                  {current.title.trim() && (
                    <HeadlineOption value={KEEP} checked={headlineChoice === KEEP} onChange={setHeadlineChoice} label={current.title} note="Keep yours" />
                  )}
                  {suggestions.headlines.map((h) => (
                    <HeadlineOption key={h} value={h} checked={headlineChoice === h} onChange={setHeadlineChoice} label={h} />
                  ))}
                  {!current.title.trim() && (
                    <HeadlineOption value={KEEP} checked={headlineChoice === KEEP} onChange={setHeadlineChoice} label="None of these" note="I’ll write my own" />
                  )}
                  {suggestions.headlines.length === 0 && <p className="text-sm text-neutral-400">No headline ideas this time.</p>}
                </div>
              </fieldset>

              <Suggestion
                id="ai-summary"
                label="Summary"
                hint={current.summary.trim() ? 'Replaces your current summary.' : 'Shown under the headline and in link previews.'}
                enabled={useSummary}
                onToggle={setUseSummary}
                value={summary}
                onChange={setSummary}
                available={Boolean(suggestions.summary)}
              />

              <Suggestion
                id="ai-meta"
                label="Search description"
                hint={current.metaDescription.trim() ? 'Replaces your current search description.' : 'For search results and link previews.'}
                enabled={useMeta}
                onToggle={setUseMeta}
                value={metaDescription}
                onChange={setMetaDescription}
                available={Boolean(suggestions.metaDescription)}
                maxLength={160}
              />

              {suggestions.readTime > 0 && (
                <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded border border-neutral-800 bg-neutral-950 px-4">
                  <input type="checkbox" checked={useReadTime} onChange={(e) => setUseReadTime(e.target.checked)} className="h-5 w-5 shrink-0 accent-orange-500" />
                  <span className="text-base">Set read time to <strong>{suggestions.readTime} min</strong> <span className="text-neutral-400">(counted from the words)</span></span>
                </label>
              )}

              {/* The formatted story, rendered the way it will publish */}
              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-200">Story</p>
                <div className="tdd-ai-preview rounded border border-neutral-800 bg-[var(--bg-primary)] px-4 py-2" data-family={topicFamily(current.topic)}>
                  <ArticleBody content={doc as any} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-800 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {step === 'paste' && (
            <>
              <button type="button" onClick={close} className={`${BUTTON} text-neutral-300 hover:bg-neutral-800`}>Cancel</button>
              <button type="button" onClick={format} disabled={!raw.trim()} className={`${BUTTON} bg-orange-600 text-white hover:bg-orange-700`}>
                ✨ Format
              </button>
            </>
          )}
          {step === 'working' && (
            <button type="button" onClick={() => { abortRef.current?.abort(); setStep('paste') }} className={`${BUTTON} text-neutral-300 hover:bg-neutral-800`}>
              Stop
            </button>
          )}
          {step === 'review' && (
            <>
              <button type="button" onClick={close} className={`${BUTTON} text-neutral-300 hover:bg-neutral-800`}>Discard</button>
              <button type="button" onClick={() => setStep('paste')} className={`${BUTTON} border border-neutral-700 text-neutral-200 hover:border-neutral-500`}>
                Edit draft
              </button>
              <button type="button" onClick={apply} className={`${BUTTON} bg-orange-600 text-white hover:bg-orange-700`}>
                Apply
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function HeadlineOption({ value, checked, onChange, label, note }: { value: string; checked: boolean; onChange: (v: string) => void; label: string; note?: string }) {
  return (
    <label className={`flex min-h-[48px] cursor-pointer items-start gap-3 rounded border px-4 py-3 ${checked ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-950'}`}>
      <input type="radio" name="ai-headline" value={value} checked={checked} onChange={() => onChange(value)} className="mt-1 h-5 w-5 shrink-0 accent-orange-500" />
      <span className="text-base leading-snug">
        {label}
        {note && <span className="ml-2 text-sm text-neutral-400">{note}</span>}
      </span>
    </label>
  )
}

function Suggestion({
  id, label, hint, enabled, onToggle, value, onChange, available, maxLength,
}: {
  id: string; label: string; hint: string; enabled: boolean; onToggle: (v: boolean) => void
  value: string; onChange: (v: string) => void; available: boolean; maxLength?: number
}) {
  if (!available) return null
  return (
    <div className="space-y-2">
      <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
        <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="h-5 w-5 shrink-0 accent-orange-500" />
        <span className="text-sm font-semibold text-neutral-200">Use this {label.toLowerCase()}</span>
      </label>
      <label htmlFor={id} className="sr-only">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className={`${FIELD} h-24 ${enabled ? '' : 'opacity-60'}`}
      />
      <p className="text-sm text-neutral-400">{hint}{maxLength ? ` ${value.length}/${maxLength}` : ''}</p>
    </div>
  )
}
