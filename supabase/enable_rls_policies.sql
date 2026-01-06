-- Enable Row Level Security on public tables
-- Run this in your Supabase SQL editor

-- =============================================
-- 1. NEWSLETTER_SUBS TABLE
-- =============================================

ALTER TABLE public.newsletter_subs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for newsletter subscriptions"
ON public.newsletter_subs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read access to newsletter_subs"
ON public.newsletter_subs
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access to newsletter_subs"
ON public.newsletter_subs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 2. ARTICLES TABLE
-- =============================================

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published articles"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (published = true);

CREATE POLICY "Allow service role full access to articles"
ON public.articles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 3. AI_NEWS_STREAM TABLE
-- =============================================

ALTER TABLE public.ai_news_stream ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ai_news_stream"
ON public.ai_news_stream
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access to ai_news_stream"
ON public.ai_news_stream
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 4. YOUTUBE_VIDEOS TABLE
-- =============================================

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to youtube_videos"
ON public.youtube_videos
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access to youtube_videos"
ON public.youtube_videos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 5. LNLS_TAKES TABLE
-- =============================================

ALTER TABLE public.lnls_takes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to takes"
ON public.lnls_takes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access to lnls_takes"
ON public.lnls_takes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 6. LNLS_WRITERS TABLE
-- =============================================

ALTER TABLE public.lnls_writers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to writers"
ON public.lnls_writers
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access to lnls_writers"
ON public.lnls_writers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 7. FEATURED_MODAL_CONFIG TABLE
-- =============================================

ALTER TABLE public.featured_modal_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to featured_modal_config"
ON public.featured_modal_config
FOR SELECT
TO anon, authenticated
USING (enabled = true);

CREATE POLICY "Allow service role full access to featured_modal_config"
ON public.featured_modal_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 8. SUBSCRIBERS TABLE
-- =============================================

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for subscribers"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow service role full access to subscribers"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 9. VIDEOS TABLE
-- =============================================

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to videos"
ON public.videos
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service role full access to videos"
ON public.videos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 10. EMAIL_SENDS TABLE
-- =============================================

ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to email_sends"
ON public.email_sends
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
