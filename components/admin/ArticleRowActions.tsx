'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ArticleRowActionsProps {
  slug: string
  published: boolean
}

type ActionState = 'draft' | 'delete' | null

export default function ArticleRowActions({ slug, published }: ArticleRowActionsProps) {
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<ActionState>(null)
  const [error, setError] = useState('')

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

  return (
    <div className="flex flex-col items-end gap-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {published && (
          <button
            type="button"
            onClick={handleDraft}
            disabled={pendingAction !== null}
            className="px-3 py-1 rounded bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60 disabled:opacity-60"
          >
            {pendingAction === 'draft' ? 'Sending…' : 'Send to Draft'}
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pendingAction !== null}
          className="px-3 py-1 rounded bg-red-900/50 text-red-300 hover:bg-red-900/70 disabled:opacity-60"
        >
          {pendingAction === 'delete' ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
