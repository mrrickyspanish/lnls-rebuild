-- Enable Row Level Security on public tables
-- Run this in your Supabase SQL editor

-- =============================================
-- FIRST: CHECK WHAT TABLES ACTUALLY EXIST
-- =============================================
-- Run this query first to see all your tables:

SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Then uncomment and run only the sections below for tables that exist

/*
-- =============================================
-- 1. NEWSLETTER_SUBS TABLE (or newsletter_subscribers)
-- =============================================

-- Enable RLS
ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for subscriptions)
CREATE POLICY "Allow public insert for newsletter subscriptions"
ON public.newsletter_subs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public to view all subscriptions (for display purposes)
CREATE POLICY "Allow public read access to newsletter_subs"
ON public.newsletter_subs
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow service role full access (for your backend)
CREATE POLICY "Allow service role full access to newsletter_subs"
ON public.newsletter_subs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
*/

/*
-- =============================================
-- 2. ARTICLES TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles
CREATE POLICY "Allow public read access to articles"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to articles"
ON public.articles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
*/

/*
-- =============================================
-- 3. AI_NEWS_STREAM TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.ai_news_stream ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved/featured news
CREATE POLICY "Allow public read access to ai_news_stream"
ON public.ai_news_stream
FOR SELECT
TO anon, authenticated
USING (status IN ('approved', 'featured'));

-- Allow service role full access
CREATE POLICY "Allow service role full access to ai_news_stream"
ON public.ai_news_stream
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
*/

/*
-- =============================================
-- 4. YOUTUBE_VIDEOS TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to youtube_videos"
ON public.youtube_videos
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to youtube_videos"
ON public.youtube_videos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
*/

/*
