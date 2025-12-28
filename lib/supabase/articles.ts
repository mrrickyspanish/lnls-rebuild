import { normalizeArticleBody } from '@/lib/articles/body'
import { createSupabaseAnonClient } from '@/lib/supabase/client'
import type { Article, Database } from '@/types/supabase'

const ARTICLE_FIELDS = `
  id,
  title,
  slug,
  excerpt,
  hero_image_url,
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
  created_at,
  views
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
  
  // First get the current views count
  const { data: article } = await supabase
    .from('articles')
    .select('views')
    .eq('slug', slug)
    .single();

  if (article) {
    // Increment and update
    const { error } = await supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 } as Partial<Article>)
      .eq('slug', slug);

    if (error) {
      console.error('Failed to increment article views:', error);
    }
  }
}
