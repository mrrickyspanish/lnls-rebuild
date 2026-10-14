import { NextResponse } from 'next/server'

import { docToPlainText } from '@/lib/articles/plain-text'
import { normalizeTags } from '@/lib/articles/tags'
import { fetchPublishedArticles } from '@/lib/supabase/articles'
import { bucketFor } from '@/lib/topics'

/**
 * Site search over published stories: headline, tags, bucket, summary,
 * and the story text. Every word of the query has to match somewhere
 * (case-insensitive). Results rank headline and tag hits above summary and
 * body hits, then newest first.
 *
 * The archive is small (tens of stories), so this reads the published
 * stories and matches in memory rather than needing a search index.
 */
export const revalidate = 0

function fold(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ')
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  const words = fold(q).split(' ').filter(Boolean).slice(0, 8)
  if (words.length === 0) return NextResponse.json({ results: [] })

  const articles = await fetchPublishedArticles(500)
  const results = articles
    .map((article) => {
      const tags = normalizeTags(article.tags)
      const fields = {
        title: fold(article.title),
        tags: fold(tags.join(' ') + ' ' + bucketFor(article.topic)),
        summary: fold(`${article.excerpt ?? ''} ${article.meta_description ?? ''} ${article.author_name ?? ''}`),
        body: fold(docToPlainText(article.body as any)),
      }
      let score = 0
      for (const word of words) {
        const inTitle = fields.title.includes(word)
        const inTags = fields.tags.includes(word)
        const inSummary = fields.summary.includes(word)
        const inBody = fields.body.includes(word)
        if (!inTitle && !inTags && !inSummary && !inBody) return null
        score += (inTitle ? 6 : 0) + (inTags ? 5 : 0) + (inSummary ? 2 : 0) + (inBody ? 1 : 0)
      }
      return {
        score,
        result: {
          id: article.id,
          type: 'article',
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          image: article.hero_image_url || null,
          category: bucketFor(article.topic),
          tags,
          author: article.author_name,
          publishedAt: article.published_at || article.created_at,
          readTime: article.read_time,
        },
      }
    })
    .filter((hit): hit is NonNullable<typeof hit> => hit !== null)
    .sort((a, b) => b.score - a.score || Date.parse(b.result.publishedAt) - Date.parse(a.result.publishedAt))
    .slice(0, 30)
    .map((hit) => hit.result)

  return NextResponse.json({ results })
}
