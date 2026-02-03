-- Add meta_description column to articles table
-- Run this in your Supabase SQL Editor

ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

COMMENT ON COLUMN articles.meta_description IS 'Custom SEO meta description (optional, defaults to excerpt if not provided)';
