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
  topic?: string
): Promise<Article[]> {
  const supabase = createSupabaseAnonClient()
  let query = supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .eq('published', true)

  if (topic) {
    query = query.eq('topic', topic)
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
  topic?: string,
  limit = 6
): Promise<Article[]> {
  const supabase = createSupabaseAnonClient()
  let query = supabase
    .from('articles')
    .select(ARTICLE_FIELDS)
    .neq('id', currentId)
    .eq('published', true)

  if (topic) {
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
