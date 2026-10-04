import { getSiteUrl } from '@/lib/site'
import type { MetadataRoute } from 'next'
import { getPublishedArticles } from '@/lib/articles'

const SITE_URL = getSiteUrl()

export const revalidate = 3600

/**
 * The site shipped without a sitemap, so new articles relied entirely on
 * crawler discovery. Article rows come from Supabase; if that call fails the
 * static routes are still returned rather than failing the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/news`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/podcast`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/videos`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/subscribe`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    const articles = await getPublishedArticles(500)
    for (const article of articles) {
      if (!article.slug) continue
      const stamp = article.published_at || article.created_at
      routes.push({
        url: `${SITE_URL}/news/${article.slug}`,
        lastModified: stamp ? new Date(stamp) : undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch (error) {
    console.error('Sitemap: could not load articles, serving static routes only.', error)
  }

  return routes
}
