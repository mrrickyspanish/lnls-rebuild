import { getSiteUrl } from '@/lib/site'
import { renderShareCard, SHARE_FORMATS } from '@/lib/share/card'
import { fetchArticleBySlug } from '@/lib/supabase/articles'

/**
 * The link preview for a story: its cover, label, headline and the wordmark
 * (lib/share/card.tsx). A story that can't be found falls back to a plain
 * branded card rather than an error, so a share never shows a broken image.
 */
export const alt = 'The Daily Dribble story'
export const size = { width: SHARE_FORMATS.og.width, height: SHARE_FORMATS.og.height }
export const contentType = 'image/png'
export const revalidate = 300

export default async function StoryOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)
  return renderShareCard(
    article ?? { title: 'The Daily Dribble', hero_image_url: '', article_type: null, cover_has_text: false },
    'og',
    getSiteUrl()
  )
}
