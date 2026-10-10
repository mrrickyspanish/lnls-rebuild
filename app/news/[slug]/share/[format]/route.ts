import { NextResponse } from 'next/server'

import { isShareFormat, renderShareCard } from '@/lib/share/card'
import { fetchArticleBySlug } from '@/lib/supabase/articles'

/**
 * Downloadable share graphics for a published story:
 * /news/<slug>/share/post (4:5), /story (9:16), /square (1:1).
 * Add ?download=1 to save it as a file. The admin editor links here.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; format: string }> }
) {
  const { slug, format } = await params
  if (!isShareFormat(format) || format === 'og') {
    return NextResponse.json({ error: 'Unknown format' }, { status: 404 })
  }

  const article = await fetchArticleBySlug(slug)
  if (!article) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

  const url = new URL(request.url)
  const image = await renderShareCard(article, format, url.origin)

  const headers = new Headers(image.headers)
  headers.set('Cache-Control', 'public, max-age=0, s-maxage=300')
  if (url.searchParams.get('download')) {
    headers.set('Content-Disposition', `attachment; filename="${slug}-${format}.png"`)
  }
  return new Response(image.body, { status: 200, headers })
}
