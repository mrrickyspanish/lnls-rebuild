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
    const confirmSend = window.confirm('Send this article to all newsletter subscribers?')
    if (!confirmSend) return

    await runAction('newsletter', async () => {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter')
      }

      const sent = typeof data.sent === 'number' ? data.sent : 0
      const total = typeof data.total === 'number' ? data.total : 0
      window.alert(`Newsletter sent: ${sent}/${total}`)
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
            onClick={handleSendNewsletter}
            disabled={pendingAction !== null || newsletterSent}
            className={`${BUTTON} bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60`}
          >
            {pendingAction === 'newsletter'
              ? 'Sending…'
              : newsletterSent
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
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
    </div>
  )
}
