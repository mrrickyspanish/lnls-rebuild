-- LNLS Platform Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- News Stream Table
CREATE TABLE news_stream (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  CONSTRAINT unique_url UNIQUE (url)
);

-- Index for performance
CREATE INDEX idx_news_published ON news_stream(published_at DESC);
CREATE INDEX idx_news_featured ON news_stream(featured) WHERE featured = TRUE;
CREATE INDEX idx_news_tags ON news_stream USING GIN(tags);

-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_subscribers_active ON newsletter_subscribers(active) WHERE active = TRUE;

-- Analytics Events Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- Comments Table (Phase 2)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_approved ON comments(approved) WHERE approved = TRUE;

-- Row Level Security (RLS) Policies

-- News Stream: Public read access
ALTER TABLE news_stream ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News stream is viewable by everyone"
  ON news_stream FOR SELECT
  USING (true);

-- Newsletter: Insert only (no public reads)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Analytics: Insert only
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Comments: Read approved, insert requires email
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved comments are viewable by everyone"
  ON comments FOR SELECT
  USING (approved = true);

CREATE POLICY "Anyone can submit comments"
  ON comments FOR INSERT
  WITH CHECK (true);

-- Functions for data management

-- Function to clean old analytics data (run monthly)
CREATE OR REPLACE FUNCTION clean_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- View for featured news only
CREATE VIEW featured_news AS
SELECT * FROM news_stream
WHERE featured = TRUE
ORDER BY published_at DESC
LIMIT 5;

-- Grant permissions
GRANT SELECT ON featured_news TO anon, authenticated;
