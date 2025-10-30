import Hero from '@/components/Hero'
import NewsStream from '@/components/NewsStream'
import FeaturedArticles from '@/components/FeaturedArticles'
import LatestEpisodes from '@/components/LatestEpisodes'
import NewsletterSignup from '@/components/NewsletterSignup'
import { getNewsStream } from '@/lib/supabase/client'

export const revalidate = 300 // Revalidate every 5 minutes

interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  mainImage: any
  author: { name: string }
  publishedAt: string
  categories: Array<{ title: string; color: string }>
}

interface Episode {
  _id: string
  title: string
  slug: { current: string }
  episodeNumber?: number
  description: string
  coverImage: any
  audioUrl?: string
  duration?: string
  publishedAt: string
  hosts: Array<{ name: string }>
}

export default async function HomePage() {
  const newsData = await getNewsStream(10)

  // Placeholder data - will be replaced with real Sanity queries
  const articles: Article[] = []
  const episodes: Episode[] = []
  const featuredArticle: Article | null = null

  return (
    <main>
      {featuredArticle && <Hero article={featuredArticle} />}
      <NewsStream items={newsData} />
      <FeaturedArticles articles={articles} />
      <LatestEpisodes episodes={episodes} />
      <NewsletterSignup />
    </main>
  )
}
