'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * "Tag untagged stories": runs the backfill a few stories at a time until
 * every story has tags (or the AI can't tag what's left). Shows progress.
 */
export default function TagBackfillButton({ untagged }: { untagged: number }) {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')

  if (untagged === 0 && !message) return null

  const run = async () => {
    setRunning(true)
    setMessage('Tagging…')
    let done = 0
    let skipped = 0
    let lastRemaining = Infinity
    try {
      for (;;) {
        const response = await fetch(`/api/articles/tags/backfill?skip=${skipped}`, { method: 'POST' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Tagging failed')
        done += data.tagged
        skipped += data.skipped
        setMessage(`Tagged ${done}. ${data.remaining - skipped} left…`)
        // Safety stop: if the count of untagged stories isn't going down, the
        // saves aren't landing, so stop instead of looping forever.
        const savesNotLanding = data.tagged > 0 && data.remaining >= lastRemaining
        const noProgress = data.tagged === 0 && data.skipped === 0 && !data.finished
        if (savesNotLanding || noProgress) {
          setMessage(`Stopped: tagged ${done}, but ${data.remaining} still show as untagged. Try again later, or tag those in the editor.`)
          break
        }
        lastRemaining = data.remaining
        if (data.remaining === 0 || data.finished) {
          setMessage(data.remaining === 0
            ? `Done: tagged ${done} ${done === 1 ? 'story' : 'stories'}.`
            : `Tagged ${done}. ${data.remaining} couldn't be tagged automatically; add tags to those in the editor.`)
          break
        }
      }
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Tagging failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <p className="flex-1 text-base text-neutral-200">
        {message || `${untagged} ${untagged === 1 ? 'story has' : 'stories have'} no tags yet.`}
      </p>
      {untagged > 0 && (
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="min-h-[44px] rounded bg-red-600 px-4 font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {running ? 'Tagging…' : 'Tag them now'}
        </button>
      )}
    </div>
  )
}
