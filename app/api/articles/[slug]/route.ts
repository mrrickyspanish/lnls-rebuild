import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { isRichTextContent } from '@/lib/articles/body'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import type { ArticleBody, ArticleUpdate } from '@/types/supabase'

interface UpdateArticlePayload {
  title: string
  excerpt: string
  heroImageUrl: string
  imageCredit?: string
  authorName: string
  authorBio?: string
  authorTwitter?: string
  readTime: number
  topic: string
  body: ArticleBody
  videoUrl?: string
}

const REQUIRED_FIELDS: Array<keyof UpdateArticlePayload> = [
  'title',
  'excerpt',
  'heroImageUrl',
  'authorName',
  'readTime',
  'topic',
  'body'
]

function validatePayload(payload: UpdateArticlePayload) {
  for (const field of REQUIRED_FIELDS) {
    const value = payload[field]
    if (field === 'body') {
      if (!isRichTextContent(value)) return 'Article body is required'
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const rawPayload = (await request.json()) as UpdateArticlePayload
    const errorMessage = validatePayload(rawPayload)

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    // Check if article exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle<{ id: string }>()

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const updatePayload: ArticleUpdate = {
      title: rawPayload.title.trim(),
      excerpt: rawPayload.excerpt.trim(),
      hero_image_url: rawPayload.heroImageUrl.trim(),
      image_credit: rawPayload.imageCredit?.trim() || null,
      author_name: rawPayload.authorName.trim(),
      author_bio: rawPayload.authorBio?.trim() || null,
      author_twitter: rawPayload.authorTwitter?.trim() || null,
      read_time: rawPayload.readTime,
      topic: rawPayload.topic.trim(),
      body: rawPayload.body,
      video_url: rawPayload.videoUrl?.trim() || null,
      // We don't update slug, published_at, or created_at on edit usually
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update(updatePayload as any)
      .eq('slug', slug)

    if (updateError) {
      console.error('Article update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
    }

    revalidatePath('/news')
    revalidatePath(`/news/${slug}`)
    revalidatePath('/admin')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseServiceClient()

    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle<{ id: string }>()

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', existingArticle.id)

    if (deleteError) {
      console.error('Article delete failed:', deleteError)
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
    }

    revalidatePath('/news')
    revalidatePath('/admin')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
