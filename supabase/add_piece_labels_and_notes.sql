-- Piece labels, rumor sourcing, and update/correction notes.
-- Run this in the Supabase SQL Editor BEFORE deploying the code that uses it:
-- the admin editor sends these fields on every save, and a save fails until
-- the columns exist. Reading the site does not depend on them.

-- What kind of piece it is. Shown on the story, its cards, and in search
-- results as the schema.org article type. NULL = not labeled yet (older pieces).
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS article_type TEXT;

ALTER TABLE articles
  DROP CONSTRAINT IF EXISTS articles_article_type_check;
ALTER TABLE articles
  ADD CONSTRAINT articles_article_type_check
  CHECK (article_type IS NULL OR article_type IN ('opinion', 'analysis', 'report', 'rumor'));

-- Who is reporting a rumor. Required by the editor when the label is Rumor.
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS rumor_source TEXT;

-- One note at the top of a story: an update (new information) or a
-- correction (something in it was wrong). note_at is stamped by the server
-- whenever the note text changes.
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS note_kind TEXT,
  ADD COLUMN IF NOT EXISTS note_text TEXT,
  ADD COLUMN IF NOT EXISTS note_at TIMESTAMPTZ;

ALTER TABLE articles
  DROP CONSTRAINT IF EXISTS articles_note_kind_check;
ALTER TABLE articles
  ADD CONSTRAINT articles_note_kind_check
  CHECK (note_kind IS NULL OR note_kind IN ('update', 'correction'));

COMMENT ON COLUMN articles.article_type IS 'Piece label: opinion, analysis, report, or rumor';
COMMENT ON COLUMN articles.rumor_source IS 'Who is reporting the rumor (shown on Rumor pieces)';
COMMENT ON COLUMN articles.note_kind IS 'update or correction';
COMMENT ON COLUMN articles.note_text IS 'Update or correction note shown at the top of the story';
COMMENT ON COLUMN articles.note_at IS 'When the note was last changed';

-- OPTIONAL, not run by default. Older stories were bylined "TDD Sports Staff".
-- If those were all yours, uncomment to put your name on them:
-- UPDATE articles
--   SET author_name = 'Rick Barnes Jr.',
--       author_twitter = '@mrrickyspanish',
--       author_bio = 'Founder of The Daily Dribble & Creative Eye Studios. Digital creator and sports storyteller mixing hoops, culture, and life. Patiently persistent.'
--   WHERE author_name = 'TDD Sports Staff';
