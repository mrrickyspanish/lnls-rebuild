-- Marks covers that have words designed into the image.
-- Those are shown whole (never cropped) and the share graphics skip the image
-- for them, so the headline never appears twice. New covers should be clean
-- images; the editor's "Cover has words on it" box sets this per story.

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS cover_has_text BOOLEAN NOT NULL DEFAULT FALSE;

-- Every cover that exists today is treated as having words on it. Untick the
-- clean ones in the editor.
UPDATE articles SET cover_has_text = TRUE;

COMMENT ON COLUMN articles.cover_has_text IS 'Cover image has words designed into it: show it whole, keep it out of share graphics';
