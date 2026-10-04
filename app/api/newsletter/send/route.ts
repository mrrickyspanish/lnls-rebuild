import { getSiteUrl } from '@/lib/site'
import { requireAdmin } from '@/lib/auth/guard'
import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'
import { createSupabaseServiceClient } from '@/lib/supabase/client'

function buildArticleUrl(slug: string): string {
  const base = getSiteUrl()
  return `${base.replace(/\/$/, '')}/news/${slug}`
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { slug } = (await request.json()) as { slug?: string }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const qstashToken = process.env.QSTASH_TOKEN
    if (!qstashToken) {
      return NextResponse.json({ error: 'QSTASH_TOKEN missing' }, { status: 500 })
    }

    const supabase = createSupabaseServiceClient()
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('title, excerpt, slug, hero_image_url, published, last_newsletter_sent_at')
      .eq('slug', slug)
      .maybeSingle()

    if (articleError) {
      console.error('Newsletter article lookup failed:', articleError)
      return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
    }

    if (!article || !article.published) {
      return NextResponse.json({ error: 'Article not found or unpublished' }, { status: 404 })
    }

    if (article.last_newsletter_sent_at) {
      return NextResponse.json(
        { error: 'Newsletter already sent for this article' },
        { status: 409 }
      )
    }
    const client = new Client({ token: qstashToken })
    const jobUrl = `${getSiteUrl()}/api/newsletter/send-job`

    await client.publishJSON({
      url: jobUrl,
      body: { slug },
    })

    return NextResponse.json({ ok: true, queued: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Newsletter send route crash:', msg)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
