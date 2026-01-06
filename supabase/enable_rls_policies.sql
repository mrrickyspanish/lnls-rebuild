-- Enable Row Level Security on public tables
-- Run this in your Supabase SQL editor

-- =============================================
-- 1. NEWSLETTER_SUBS TABLE
-- =============================================

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


-- =============================================
-- 2. PROFILES TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles
CREATE POLICY "Allow public read access to profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Users can update their own profile
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "Allow service role full access to profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 3. COMMENTS TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved comments
CREATE POLICY "Allow public read access to comments"
ON public.comments
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Authenticated users can insert comments
CREATE POLICY "Allow authenticated users to insert comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Users can update/delete their own comments
CREATE POLICY "Allow users to update own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow service role full access
CREATE POLICY "Allow service role full access to comments"
ON public.comments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 4. AI_NEWS_STREAM TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.ai_news_stream ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved/featured news
CREATE POLICY "Allow public read access to ai_news_stream"
ON public.ai_news_stream
FOR SELECT
TO anon, authenticated
USING (status IN ('approved', 'featured'));

-- Only admins can manage AI news
CREATE POLICY "Allow admins to manage ai_news_stream"
ON public.ai_news_stream
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Allow service role full access
CREATE POLICY "Allow service role full access to ai_news_stream"
ON public.ai_news_stream
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 4. FIX SECURITY DEFINER VIEW
-- =============================================

-- Option 1: Remove SECURITY DEFINER (use invoker's permissions)
-- DROP VIEW IF EXISTS public.ai_news_with_latest_take;
-- CREATE VIEW public.ai_news_with_latest_take AS
-- ... (your view definition without SECURITY DEFINER)

-- Option 2: If SECURITY DEFINER is needed, add RLS check within the view
-- Ensure the view definition only returns data the user should see


-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('newsletter_subs', 'profiles', 'comments', 'ai_news_stream');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('newsletter_subs', 'profiles', 'comments', 'ai_news_stream')
ORDER BY tablename, policyname;
