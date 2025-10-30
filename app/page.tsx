import Hero from '@/components/Hero'
import NewsStream from '@/components/NewsStream'
import FeaturedArticles from '@/components/FeaturedArticles'
import LatestEpisodes from '@/components/LatestEpisodes'
import NewsletterSignup from '@/components/NewsletterSignup'
import { getNewsStream } from '@/lib/supabase/client'

export const revalidate = 300 // Revalidate every 5 minutes

export default async function HomePage() {
  const newsData = await getNewsStream(10)

  // Placeholder data - will be replaced with real Sanity queries
  const articles = []
  const episodes = []

  return (
    <main>
      <Hero />
      <NewsStream news={newsData} />
      <FeaturedArticles articles={articles} />
      <LatestEpisodes episodes={episodes} />
      <NewsletterSignup />
    </main>
  )
}
