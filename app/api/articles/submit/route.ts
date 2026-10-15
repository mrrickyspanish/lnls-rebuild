import { requireAdmin } from '@/lib/auth/guard'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { isRichTextContent } from '@/lib/articles/body'
import { generateTags } from '@/lib/ai/tags'
import { docToPlainText } from '@/lib/articles/plain-text'
import { canonicalizeTags, normalizeTags } from '@/lib/articles/tags'
import { fetchTagVocabulary } from '@/lib/supabase/articles'
import { missingColumnMessage, readTrustFields, type TrustFieldsPayload } from '@/lib/articles/trust-fields'
import { generateSlug } from '@/lib/slug'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import type { ArticleBody, ArticleInsert } from '@/types/supabase'


// Room for the AI tagging call on a save with no tags.
export const maxDuration = 60
interface SubmitArticlePayload extends TrustFieldsPayload {
  title: string
  excerpt: string
  metaDescription?: string
  heroImageUrl: string
  imageCredit?: string
  authorName: string
  authorBio?: string
  authorTwitter?: string
  readTime: number
  topic: string
  body: ArticleBody
  videoUrl?: string
  featured?: boolean
  coverHasText?: boolean
  tags?: string[]
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

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const rawPayload = (await request.json()) as SubmitArticlePayload
    const errorMessage = validatePayload(rawPayload)

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const trust = readTrustFields(rawPayload)
    if (!trust.fields) {
      return NextResponse.json({ error: trust.error }, { status: 400 })
    }

    // Tags: the writer's, or generated from the story when there are none.
    // Tagging failures never block a save (generateTags returns []).
    // Both snap to the site's existing tag spellings so one subject keeps one tag.
    const vocabulary = await fetchTagVocabulary()
    let tags = canonicalizeTags(normalizeTags(rawPayload.tags), vocabulary)
    if (tags.length === 0) {
      tags = await generateTags({
        title: rawPayload.title,
        excerpt: rawPayload.excerpt,
        text: docToPlainText(rawPayload.body as any),
        vocabulary,
      })
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
      meta_description: rawPayload.metaDescription?.trim() || null,
      hero_image_url: rawPayload.heroImageUrl.trim(),
      image_credit: rawPayload.imageCredit?.trim() || null,
      author_name: rawPayload.authorName.trim(),
      author_bio: rawPayload.authorBio?.trim() || null,
      author_twitter: rawPayload.authorTwitter?.trim() || null,
      read_time: rawPayload.readTime,
      topic: rawPayload.topic.trim(),
      body: rawPayload.body,
      video_url: rawPayload.videoUrl?.trim() || null,
      published: true,
      featured: Boolean(rawPayload.featured),
      published_at: new Date().toISOString(),
      // A new story has nothing to update or correct yet.
      article_type: trust.fields.article_type,
      rumor_source: trust.fields.rumor_source,
      cover_has_text: Boolean(rawPayload.coverHasText),
      tags,
    }

    const { error: insertError } = await (supabase.from('articles') as any).insert([insertPayload])

    if (insertError) {
      console.error('Article insert failed:', insertError)
      return NextResponse.json(
        { error: missingColumnMessage(insertError) ?? 'Failed to save article' },
        { status: 500 }
      )
    }

    // One pinned story at a time: pinning this one unpins any other.
    if (insertPayload.featured) {
      const { error: unpinError } = await supabase
        .from('articles')
        .update({ featured: false } as any)
        .eq('featured', true)
        .neq('slug', slug)
      if (unpinError) console.error('Unpinning other stories failed:', unpinError)
    }

    revalidatePath('/news')
    revalidatePath(`/news/${slug}`)
    revalidatePath('/')
    revalidatePath('/admin')

    return NextResponse.json({ ok: true, slug })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('Article submit route crashed:', message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
