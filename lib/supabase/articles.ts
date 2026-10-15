import { normalizeArticleBody } from '@/lib/articles/body'
import { createSupabaseAnonClient, createSupabaseServiceClient } from '@/lib/supabase/client'
import type { Article, Database } from '@/types/supabase'

// Every column. Kept as '*' rather than a list so that a column added by a
// migration (e.g. supabase/add_piece_labels_and_notes.sql) is picked up once
// it exists, and its absence before then can't break every page that reads
// articles: a listed column that doesn't exist fails the whole query.
const ARTICLE_FIELDS = '*'

type ArticleRow = Database['public']['Tables']['articles']['Row']

function mapArticle(row: ArticleRow): Article {
  return {
    ...row,
    body: normalizeArticleBody(row.body)
  }
}

const DEFAULT_LIMIT = 24

export async function fetchPublishedArticles(
  limit = DEFAULT_LIMIT,
  topic?: string | string[],
  tag?: string
): Promise<Article[]> {
  const supabase = createSupabaseAnonClient()
  let query = supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('published', true)

  if (Array.isArray(topic)) {
    query = query.in('topic', topic)
  } else if (topic) {
    query = query.eq('topic', topic)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch published articles:', error)
    return []
  }

  return (data ?? []).map(mapArticle)
}

export async function fetchFeaturedArticles(
  limit = DEFAULT_LIMIT
): Promise<Article[]> {
  const supabase = createSupabaseAnonClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('published', true)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch featured articles:', error)
    return []
  }

  return (data ?? []).map(mapArticle)
}

export async function fetchArticlesBySlugs(slugs: string[]): Promise<Article[]> {
  const normalized = (slugs ?? [])
    .map((s) => String(s || '').trim())
    .filter(Boolean)

  if (normalized.length === 0) return []

  const supabase = createSupabaseAnonClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('published', true)
    .in('slug', normalized)

  if (error) {
    console.error('Failed to fetch articles by slugs:', error)
    return []
  }

  return (data ?? []).map(mapArticle)
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createSupabaseAnonClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch article by slug:', error)
    return null
  }

  return data ? mapArticle(data) : null
}

/**
 * Admin only (app/admin/submit/[slug], which middleware gates). Uses the
 * service key: the public key can only read published articles, so drafts
 * could not be opened for editing.
 */
export async function fetchArticleForEdit(slug: string): Promise<Article | null> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch article for edit:', error)
    return null
  }

  return data ? mapArticle(data) : null
}

export async function fetchRelatedArticles(
  currentId: string,
  topic?: string | string[],
  limit = 6
): Promise<Article[]> {
  const supabase = createSupabaseAnonClient()
  let query = supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .neq('id', currentId)
    .eq('published', true)

  if (Array.isArray(topic)) {
    query = query.in('topic', topic)
  } else if (topic) {
    query = query.eq('topic', topic)
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch related articles:', error)
    return []
  }

  return (data ?? []).map(mapArticle)
}

/**
 * Admin only (app/admin, which middleware gates). Uses the service key: the
 * public key can only read published articles, so the dashboard's Drafts
 * table came back empty.
 */
export async function fetchAllArticles(): Promise<Article[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch all articles:', error)
    return []
  }

  return (data ?? []).map(mapArticle)
}

/**
 * Every tag in use, most-used first: what the AI tagger is told to reuse and
 * what typed tags are snapped to (lib/articles/tags.ts canonicalizeTags).
 * Empty if the tags column doesn't exist yet.
 */
export async function fetchTagVocabulary(limit = 200): Promise<string[]> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.from('articles').select('tags')
  if (error || !data) return []
  const counts = new Map<string, { tag: string; n: number }>()
  for (const row of data as Array<{ tags?: string[] | null }>) {
    for (const tag of row.tags ?? []) {
      const key = tag.toLowerCase()
      const entry = counts.get(key)
      if (entry) entry.n += 1
      else counts.set(key, { tag, n: 1 })
    }
  }
  return [...counts.values()].sort((a, b) => b.n - a.n).slice(0, limit).map((entry) => entry.tag)
}
