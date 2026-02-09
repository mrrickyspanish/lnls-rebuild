import { normalizeArticleBody } from '@/lib/articles/body'
import { createSupabaseAnonClient } from '@/lib/supabase/client'
import type { Article, Database } from '@/types/supabase'

const ARTICLE_FIELDS = `
  id,
  title,
  slug,
  excerpt,
  meta_description,
  hero_image_url,
  image_credit,
  author_name,
  author_bio,
  author_twitter,
  read_time,
  topic,
  body,
  video_url,
  published,
  featured,
  published_at,
  last_newsletter_sent_at,
  created_at,
  updated_at,
  views,
  likes
`

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

export async function fetchArticleForEdit(slug: string): Promise<Article | null> {
  const supabase = createSupabaseAnonClient()
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

export async function fetchAllArticles(): Promise<Article[]> {
  const supabase = createSupabaseAnonClient()
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

// Increment view count for an article
export async function incrementArticleViews(slug: string): Promise<void> {
  const supabase = createSupabaseAnonClient();
  const { error } = await supabase.rpc('increment_article_views', { article_slug: slug });
  if (error) {
    console.error('Failed to increment article views:', error);
  }
}
