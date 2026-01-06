import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchClient } from './search-client'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search TDD articles, videos, and podcasts.',
}

// this page depends on client router state
export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[var(--netflix-bg)] text-white pt-[140px] md:pt-[180px]">
      <section className="sticky top-0 z-10 border-b border-white/5 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Search</p>
          <h1 className="text-4xl font-bold tracking-tight">Find articles, pods, and clips fast.</h1>
          <p className="text-white/60">
            The live search below pulls from every feed. Start typing to surface highlights from Court, Code,
            and Culture without losing your place.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <Suspense fallback={<p className="text-white/50">Loading search…</p>}>
            <SearchClient />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
