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

-- Allow authenticated users to view their own subscription
CREATE POLICY "Allow users to view own subscription"
ON public.newsletter_subs
FOR SELECT
TO authenticated
USING (auth.uid()::text = id OR auth.jwt()->>'role' = 'admin');

-- Allow service role full access (for your backend)
CREATE POLICY "Allow service role full access to newsletter_subs"
ON public.newsletter_subs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 2. LNLS_TAKES TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.lnls_takes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to takes"
ON public.lnls_takes
FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Allow authenticated users to insert takes"
ON public.lnls_takes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only update/delete their own takes
CREATE POLICY "Allow users to update own takes"
ON public.lnls_takes
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own takes"
ON public.lnls_takes
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow service role full access
CREATE POLICY "Allow service role full access to lnls_takes"
ON public.lnls_takes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- =============================================
-- 3. LNLS_WRITERS TABLE
-- =============================================

-- Enable RLS
ALTER TABLE public.lnls_writers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to writers"
ON public.lnls_writers
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert/update/delete writers
CREATE POLICY "Allow admins to manage writers"
ON public.lnls_writers
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Allow service role full access
CREATE POLICY "Allow service role full access to lnls_writers"
ON public.lnls_writers
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
AND tablename IN ('newsletter_subs', 'lnls_takes', 'lnls_writers');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('newsletter_subs', 'lnls_takes', 'lnls_writers')
ORDER BY tablename, policyname;
