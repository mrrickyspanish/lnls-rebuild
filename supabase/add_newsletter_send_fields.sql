-- Add newsletter send tracking and unsubscribe token support

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS last_newsletter_sent_at TIMESTAMPTZ;

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;
