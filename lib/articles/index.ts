import { fetchArticlesBySlugs, fetchFeaturedArticles, fetchPublishedArticles } from '@/lib/supabase/articles'

export const getPublishedArticles = fetchPublishedArticles
export const getFeaturedArticles = fetchFeaturedArticles
export const getArticlesBySlugs = fetchArticlesBySlugs
