import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { isArticleBodyBlocks } from '@/lib/articles/body'
import { generateSlug } from '@/lib/slug'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import type { ArticleBodyBlock, ArticleInsert } from '@/types/supabase'

interface SubmitArticlePayload {
  title: string
  excerpt: string
  heroImageUrl: string
  authorName: string
  authorBio?: string
  authorTwitter?: string
  readTime: number
  topic: string
  body: ArticleBodyBlock[]
  videoUrl?: string
  slug?: string
}

const REQUIRED_FIELDS: Array<keyof SubmitArticlePayload> = [
  'title',
  'excerpt',
  'heroImageUrl',
  'authorName',
  'readTime',
  'topic',
  'body'
]

function validatePayload(payload: SubmitArticlePayload) {
  for (const field of REQUIRED_FIELDS) {
    const value = payload[field]
    if (field === 'body') {
      if (!isArticleBodyBlocks(value)) return 'Article body is required'
      continue
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value) || value <= 0) return `${field} must be greater than 0`
      continue
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      return `${field} is required`
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    const rawPayload = (await request.json()) as SubmitArticlePayload
    const errorMessage = validatePayload(rawPayload)

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    const slug = generateSlug(rawPayload.slug || rawPayload.title)

    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (fetchError) {
      console.error('Article slug lookup failed:', fetchError)
      return NextResponse.json({ error: 'Failed to verify slug uniqueness' }, { status: 500 })
    }

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 409 }
      )
    }

    const insertPayload: ArticleInsert = {
      title: rawPayload.title.trim(),
      slug,
      excerpt: rawPayload.excerpt.trim(),
      hero_image_url: rawPayload.heroImageUrl.trim(),
      author_name: rawPayload.authorName.trim(),
      author_bio: rawPayload.authorBio?.trim() || null,
      author_twitter: rawPayload.authorTwitter?.trim() || null,
      read_time: rawPayload.readTime,
      topic: rawPayload.topic.trim(),
      body: rawPayload.body,
      video_url: rawPayload.videoUrl?.trim() || null,
      published: true,
      featured: false,
      published_at: new Date().toISOString()
    }

    const { error: insertError } = await (supabase.from('articles') as any).insert([insertPayload])

    if (insertError) {
      console.error('Article insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to save article' }, { status: 500 })
    }

    revalidatePath('/news')
    revalidatePath(`/news/${slug}`)

    return NextResponse.json({ ok: true, slug })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('Article submit route crashed:', message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
