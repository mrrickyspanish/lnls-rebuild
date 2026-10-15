import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { requireAdmin } from '@/lib/auth/guard'
import { generateTags } from '@/lib/ai/tags'
import { docToPlainText } from '@/lib/articles/plain-text'
import { normalizeArticleBody } from '@/lib/articles/body'
import { missingColumnMessage } from '@/lib/articles/trust-fields'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import { fetchTagVocabulary } from '@/lib/supabase/articles'

/**
 * One-time backfill: tags a few untagged stories per call (each needs an AI
 * call), and reports how many are left. The admin button calls it in a loop
 * until nothing is left, so no single request runs long.
 */
export const maxDuration = 300
const PER_CALL = 4

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .filter('tags', 'eq', '{}')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Tag backfill lookup failed:', error)
    return NextResponse.json({ error: missingColumnMessage(error) ?? 'Could not load stories' }, { status: 500 })
  }

  const untagged = (data ?? []) as Array<{ id: string; title: string; excerpt: string | null; body: unknown }>
  // Stories the AI couldn't tag stay untagged; the client passes how many it
  // has already skipped so the next call moves past them instead of retrying.
  const skip = Math.max(0, Number(new URL(request.url).searchParams.get('skip')) || 0)
  const batch = untagged.slice(skip, skip + PER_CALL)
  let tagged = 0
  let skipped = 0

  // Grows as the backfill runs, so later stories reuse earlier stories' tags.
  const vocabulary = await fetchTagVocabulary()
  for (const article of batch) {
    const tags = await generateTags({
      title: article.title,
      excerpt: article.excerpt,
      text: docToPlainText(normalizeArticleBody(article.body as any) as any),
      vocabulary,
    })
    for (const tag of tags) if (!vocabulary.some((t) => t.toLowerCase() === tag.toLowerCase())) vocabulary.push(tag)
    if (tags.length === 0) { skipped += 1; continue }
    const { error: updateError } = await supabase.from('articles').update({ tags } as any).eq('id', article.id)
    if (updateError) { console.error('Tag backfill update failed:', updateError); skipped += 1 } else tagged += 1
  }

  if (tagged > 0) {
    revalidatePath('/news')
    revalidatePath('/')
  }

  const remaining = untagged.length - tagged
  return NextResponse.json({ tagged, skipped, remaining, finished: skip + skipped >= remaining })
}
