'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ArticleRowActionsProps {
  slug: string
  published: boolean
  lastNewsletterSentAt?: string | null
  /** "end" right-aligns in the desktop table; "start" fills a phone card. */
  align?: 'start' | 'end'
}

type ActionState = 'draft' | 'publish' | 'delete' | 'newsletter' | null

// 44px tall: Apple's minimum comfortable tap target.
const BUTTON = 'min-h-[44px] px-4 rounded text-sm font-medium disabled:opacity-60'

export default function ArticleRowActions({
  slug,
  published,
  lastNewsletterSentAt,
  align = 'end',
}: ArticleRowActionsProps) {
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<ActionState>(null)
  const [error, setError] = useState('')
  // "Send Newsletter" opens a sheet for an optional line to readers, shown
  // above the story in the email (lib/newsletter/email.ts).
  const [sheetOpen, setSheetOpen] = useState(false)
  const [note, setNote] = useState('')
  const [queued, setQueued] = useState(false)

  const newsletterSent = Boolean(lastNewsletterSentAt)
  const sentLabel = lastNewsletterSentAt
    ? new Date(lastNewsletterSentAt).toLocaleString()
    : ''

  const runAction = async (action: ActionState, task: () => Promise<void>) => {
    setPendingAction(action)
    setError('')
    try {
      await task()
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setPendingAction(null)
    }
  }

  const handleDraft = async () => {
    if (!published) return
    const confirmDraft = window.confirm('Send this article back to draft?')
    if (!confirmDraft) return

    await runAction('draft', async () => {
      const response = await fetch(`/api/articles/${slug}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: false })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update article')
      }
    })
  }

  // Drafts had no way back to published: the editor's save keeps the current
  // status, and this list only offered Delete for a draft.
  const handlePublish = async () => {
    if (published) return
    const confirmPublish = window.confirm('Publish this article now?')
    if (!confirmPublish) return

    await runAction('publish', async () => {
      const response = await fetch(`/api/articles/${slug}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to publish article')
      }
    })
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Delete this article? This cannot be undone.')
    if (!confirmDelete) return

    await runAction('delete', async () => {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete article')
      }
    })
  }

  const handleSendNewsletter = async () => {
    if (!published || newsletterSent) return
    setSheetOpen(false)
    await runAction('newsletter', async () => {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, note })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter')
      }

      // The send is queued (QStash) and goes out in the background. This used
      // to alert "Newsletter sent: 0/0" because the queue reply has no counts.
      setQueued(true)
    })
  }

  return (
    <div className={`flex flex-col gap-2 text-sm ${align === 'end' ? 'items-end' : 'items-stretch'}`}>
      <div className={`flex flex-wrap items-center gap-2 ${align === 'end' ? 'justify-end' : ''}`}>
        {!published && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={pendingAction !== null}
            className={`${BUTTON} bg-emerald-700 text-white hover:bg-emerald-600`}
          >
            {pendingAction === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        )}
        {published && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            disabled={pendingAction !== null || newsletterSent || queued}
            className={`${BUTTON} bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60`}
          >
            {pendingAction === 'newsletter'
              ? 'Sending…'
              : newsletterSent || queued
                ? 'Newsletter Sent'
                : 'Send Newsletter'}
          </button>
        )}
        {published && (
          <button
            type="button"
            onClick={handleDraft}
            disabled={pendingAction !== null}
            className={`${BUTTON} bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60`}
          >
            {pendingAction === 'draft' ? 'Sending…' : 'Send to Draft'}
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pendingAction !== null}
          className={`${BUTTON} bg-red-900/50 text-red-300 hover:bg-red-900/70`}
        >
          {pendingAction === 'delete' ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {newsletterSent && (
        <p className="text-sm text-emerald-300">Newsletter sent {sentLabel}</p>
      )}
      {queued && !newsletterSent && (
        <p className="text-sm text-emerald-300" role="status">On its way. It goes out over the next minute or two.</p>
      )}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`send-${slug}`}>
          <div className="w-full max-w-lg rounded-t-xl bg-neutral-900 p-5 text-left sm:rounded-xl">
            <h2 id={`send-${slug}`} className="text-xl font-bold text-white">Email this story</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Goes to subscribers who picked this story&apos;s lane, from your name, with the headline as the subject.
            </p>
            <label htmlFor={`note-${slug}`} className="mt-4 block text-sm font-semibold text-neutral-200">
              A line from you <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <textarea
              id={`note-${slug}`}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 600))}
              className="mt-1.5 h-28 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-base text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
              placeholder="Shows above the story. e.g. Wrote this one at 2am after the game. Tell me I'm wrong."
            />
            <p className="mt-1 text-sm text-neutral-500">{note.length}/600</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSheetOpen(false)} className="min-h-[48px] rounded border border-neutral-700 font-semibold text-neutral-200">
                Cancel
              </button>
              <button type="button" onClick={handleSendNewsletter} className="min-h-[48px] rounded bg-emerald-700 font-bold text-white hover:bg-emerald-600">
                Send it
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
    </div>
  )
}
