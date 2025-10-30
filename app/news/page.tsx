import { client, queries } from '@/lib/sanity/client'
import FeaturedArticles from '@/components/FeaturedArticles'
import Link from 'next/link'

export const metadata = {
  title: 'News',
  description: 'Latest Lakers and NBA news, analysis, and opinion pieces from LNLS.',
}

export const revalidate = 60

async function getArticles() {
  const articles = await client.fetch(queries.articles)
  return articles
}

export default async function NewsPage() {
  const articles = await getArticles()

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-4">
          Latest News
        </h1>
        <p className="text-lg text-slate-muted max-w-2xl">
          In-depth analysis, breaking news, and hot takes on the Lakers and NBA.
        </p>
      </div>

      {/* Articles Grid */}
      <FeaturedArticles articles={articles} />

      {/* Load More (Phase 2) */}
      {articles.length >= 10 && (
        <div className="text-center mt-12">
          <button className="btn-secondary">
            Load More Articles
          </button>
        </div>
      )}
    </div>
  )
}
