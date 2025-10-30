import { client, queries } from '@/lib/sanity/client'
import { getNewsStream } from '@/lib/supabase/client'
import Hero from '@/components/Hero'
import NewsStream from '@/components/NewsStream'
import FeaturedArticles from '@/components/FeaturedArticles'
import LatestEpisodes from '@/components/LatestEpisodes'
import NewsletterSignup from '@/components/NewsletterSignup'

export const revalidate = 60 // Revalidate every 60 seconds

async function getHomePageData() {
  const [articles, episodes, newsData] = await Promise.all([
    client.fetch(queries.featuredArticles),
    client.fetch(queries.episodes + '[0...4]'),
    getNewsStream(10),
  ])

  return {
    articles,
    episodes,
    news: newsData.data || [],
  }
}

export default async function HomePage() {
  const { articles, episodes, news } = await getHomePageData()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero article={articles[0]} />

      {/* News Stream */}
      <section className="section-container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bebas gradient-text mb-2">
              Live News Feed
            </h2>
            <p className="text-slate-muted">
              AI-powered Lakers & NBA updates, curated by LNLS
            </p>
          </div>
        </div>
        <NewsStream items={news} />
      </section>

      {/* Featured Articles */}
      <section className="section-container py-12">
        <h2 className="text-4xl font-bebas gradient-text mb-8">
          Featured Stories
        </h2>
        <FeaturedArticles articles={articles.slice(1)} />
      </section>

      {/* Latest Episodes */}
      <section className="section-container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bebas gradient-text mb-2">
              Latest Episodes
            </h2>
            <p className="text-slate-muted">
              New conversations every week
            </p>
          </div>
        </div>
        <LatestEpisodes episodes={episodes} />
      </section>

      {/* Newsletter */}
      <section className="section-container py-16">
        <NewsletterSignup />
      </section>
    </div>
  )
}
