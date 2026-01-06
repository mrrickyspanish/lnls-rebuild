import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { createSupabaseServiceClient } from '@/lib/supabase/client'

interface ArticleStatusPayload {
  published: boolean
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = (await request.json()) as Partial<ArticleStatusPayload>

    if (typeof payload.published !== 'boolean') {
      return NextResponse.json({ error: 'published flag required' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id, published_at')
      .eq('slug', slug)
      .maybeSingle<{ id: string; published_at: string | null }>()

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const shouldPublish = payload.published
    const updatePayload = {
      published: shouldPublish,
      published_at: shouldPublish ? new Date().toISOString() : null,
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update(updatePayload as any)
      .eq('id', existingArticle.id)

    if (updateError) {
      console.error('Article status update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update article status' }, { status: 500 })
    }

    revalidatePath('/news')
    revalidatePath('/admin')
    revalidatePath('/')

    if (shouldPublish) {
      revalidatePath(`/news/${slug}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
