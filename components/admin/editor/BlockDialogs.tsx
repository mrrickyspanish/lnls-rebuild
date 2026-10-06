"use client"

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { IMAGE_SIZES, type ImageSize } from '@/lib/tiptap/article-image-extension'
import { MAX_STATS, type Stat } from '@/lib/tiptap/stat-block-extension'
import { DEFAULT_TAKEAWAYS_TITLE } from '@/lib/tiptap/key-takeaways-extension'

const inputClass =
  'w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-base text-white placeholder:text-neutral-500 focus:border-[var(--neon-orange)] focus:outline-none'
const labelClass = 'block text-sm font-semibold text-neutral-200 mb-1.5'
const hintClass = 'mt-1 text-sm text-neutral-400'

type ShellProps = {
  title: string
  submitLabel: string
  onCancel: () => void
  onSubmit: () => void
  canSubmit?: boolean
  children: React.ReactNode
}

/**
 * Portaled to <body> because the editor sits inside the article <form>, and a
 * form may not contain another form. The submit handler also stops
 * propagation: React events still bubble through portals, and an unstopped
 * submit would save the whole article.
 */
function DialogShell({ title, submitLabel, onCancel, onSubmit, canSubmit = true, children }: ShellProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLFormElement>(null)
  // Callers pass a fresh onCancel each render; read it through a ref so the
  // effect below runs once and does not pull focus back on every keystroke.
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('input:not(.sr-only), button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <form
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (canSubmit) onSubmit()
        }}
      >
        <h2 id={titleId} className="mb-5 text-xl font-bold text-white">
          {title}
        </h2>
        <div className="space-y-5">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-md px-4 text-base text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-[44px] rounded-md bg-[var(--neon-orange)] px-5 text-base font-bold text-black hover:bg-[#ff8257] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}

/* ---------- Image --------------------------------------------------------- */

export type ImageDialogValue = {
  src: string
  caption: string
  alt: string
  size: ImageSize
}

type ImageDialogProps = {
  initial: ImageDialogValue
  /** Inserting by URL shows a URL field; uploads and edits already have one. */
  askForUrl: boolean
  mode: 'insert' | 'edit'
  onCancel: () => void
  onSave: (value: ImageDialogValue) => void
}

export function ImageDialog({ initial, askForUrl, mode, onCancel, onSave }: ImageDialogProps) {
  const [value, setValue] = useState(initial)
  const set = (patch: Partial<ImageDialogValue>) => setValue((prev) => ({ ...prev, ...patch }))
  const src = value.src.trim()

  return (
    <DialogShell
      title={mode === 'edit' ? 'Edit image' : 'Add image'}
      submitLabel={mode === 'edit' ? 'Save image' : 'Add image'}
      canSubmit={Boolean(src)}
      onCancel={onCancel}
      onSubmit={() => onSave({ ...value, src, caption: value.caption.trim(), alt: value.alt.trim() })}
    >
      {askForUrl && (
        <div>
          <label className={labelClass} htmlFor="img-url">Image URL</label>
          <input id="img-url" className={inputClass} type="url" value={value.src} onChange={(e) => set({ src: e.target.value })} placeholder="https://…" />
        </div>
      )}

      {src && (
        <img src={src} alt="" className="max-h-48 w-auto rounded border border-neutral-800" />
      )}

      <div>
        <label className={labelClass} htmlFor="img-caption">Caption</label>
        <input id="img-caption" className={inputClass} value={value.caption} onChange={(e) => set({ caption: e.target.value })} placeholder="Who, what, where. Credit goes here too." />
        <p className={hintClass}>Shown under the image.</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="img-alt">Description for screen readers</label>
        <input id="img-alt" className={inputClass} value={value.alt} onChange={(e) => set({ alt: e.target.value })} placeholder="e.g. LeBron James dunking over two defenders" />
        <p className={hintClass}>Describe what is in the picture. If left blank, the caption is used.</p>
      </div>

      <fieldset>
        <legend className={labelClass}>Width on the page</legend>
        <div className="grid grid-cols-3 gap-2">
          {IMAGE_SIZES.map((option) => {
            const active = value.size === option.value
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-md border p-3 text-left transition-colors focus-within:ring-2 focus-within:ring-[var(--neon-orange)] ${
                  active ? 'border-[var(--neon-orange)] bg-[var(--neon-orange)]/10' : 'border-neutral-700 hover:border-neutral-500'
                }`}
              >
                <input
                  type="radio"
                  name="img-size"
                  value={option.value}
                  checked={active}
                  onChange={() => set({ size: option.value })}
                  className="sr-only"
                />
                <SizeDiagram size={option.value} />
                <span className="mt-2 block text-sm font-semibold text-white">{option.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-neutral-400">{option.hint}</span>
              </label>
            )
          })}
        </div>
        <p className={hintClass}>Tall images always stay narrow so they fit on screen.</p>
      </fieldset>
    </DialogShell>
  )
}

/** A tiny page sketch: gray text lines, orange image block at the chosen width. */
function SizeDiagram({ size }: { size: ImageSize }) {
  const width = size === 'column' ? 'w-1/2' : size === 'wide' ? 'w-3/4' : 'w-full'
  return (
    <span aria-hidden="true" className="flex flex-col items-center gap-1">
      <span className="h-1 w-1/2 rounded bg-neutral-600" />
      <span className={`h-4 rounded-sm bg-[var(--neon-orange)] ${width}`} />
      <span className="h-1 w-1/2 rounded bg-neutral-600" />
    </span>
  )
}

/* ---------- Stats --------------------------------------------------------- */

export type StatDialogValue = { stats: Stat[]; source: string }

type StatDialogProps = {
  initial: StatDialogValue
  mode: 'insert' | 'edit'
  onCancel: () => void
  onSave: (value: StatDialogValue) => void
}

export function StatDialog({ initial, mode, onCancel, onSave }: StatDialogProps) {
  const [stats, setStats] = useState<Stat[]>(initial.stats.length ? initial.stats : [{ value: '', label: '' }])
  const [source, setSource] = useState(initial.source)
  const complete = stats.filter((s) => s.value.trim() && s.label.trim())
  const update = (index: number, patch: Partial<Stat>) =>
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))

  return (
    <DialogShell
      title={mode === 'edit' ? 'Edit stats' : 'Add stats'}
      submitLabel={mode === 'edit' ? 'Save stats' : 'Add stats'}
      canSubmit={complete.length > 0}
      onCancel={onCancel}
      onSubmit={() => onSave({ stats: complete, source: source.trim() })}
    >
      <p className="text-sm text-neutral-400">
        One to three numbers, each with a short label. They show big, side by side.
      </p>

      {stats.map((stat, index) => (
        <div key={index} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-end gap-2">
          <div>
            <label className={labelClass} htmlFor={`stat-value-${index}`}>Number</label>
            <input id={`stat-value-${index}`} className={inputClass} value={stat.value} onChange={(e) => update(index, { value: e.target.value })} placeholder="31.4" maxLength={12} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`stat-label-${index}`}>Label</label>
            <input id={`stat-label-${index}`} className={inputClass} value={stat.label} onChange={(e) => update(index, { label: e.target.value })} placeholder="Points per game" maxLength={60} />
          </div>
          <button
            type="button"
            onClick={() => setStats((prev) => prev.filter((_, i) => i !== index))}
            disabled={stats.length === 1}
            aria-label={`Remove stat ${index + 1}`}
            className="min-h-[42px] rounded-md px-3 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:invisible"
          >
            ✕
          </button>
        </div>
      ))}

      {stats.length < MAX_STATS && (
        <button
          type="button"
          onClick={() => setStats((prev) => [...prev, { value: '', label: '' }])}
          className="min-h-[40px] rounded-md border border-dashed border-neutral-600 px-4 text-sm font-semibold text-neutral-300 hover:border-[var(--neon-orange)] hover:text-white"
        >
          + Add another stat
        </button>
      )}

      <div>
        <label className={labelClass} htmlFor="stat-source">Source (optional)</label>
        <input id="stat-source" className={inputClass} value={source} onChange={(e) => setSource(e.target.value)} placeholder="NBA.com, through Jan. 12" />
      </div>
    </DialogShell>
  )
}

/* ---------- Key takeaways -------------------------------------------------- */

type TakeawaysDialogProps = {
  initialTitle: string
  mode: 'insert' | 'edit'
  onCancel: () => void
  onSave: (title: string) => void
}

export function TakeawaysDialog({ initialTitle, mode, onCancel, onSave }: TakeawaysDialogProps) {
  const [title, setTitle] = useState(initialTitle || DEFAULT_TAKEAWAYS_TITLE)
  return (
    <DialogShell
      title={mode === 'edit' ? 'Rename takeaways box' : 'Add key takeaways'}
      submitLabel={mode === 'edit' ? 'Save' : 'Add box'}
      onCancel={onCancel}
      onSubmit={() => onSave(title.trim() || DEFAULT_TAKEAWAYS_TITLE)}
    >
      <div>
        <label className={labelClass} htmlFor="takeaways-title">Box heading</label>
        <input id="takeaways-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} />
        <p className={hintClass}>
          {mode === 'edit'
            ? 'The bullets are edited right in the article.'
            : 'You type the bullets right in the article after adding the box. Two to four short points works best, near the top of the story.'}
        </p>
      </div>
    </DialogShell>
  )
}
