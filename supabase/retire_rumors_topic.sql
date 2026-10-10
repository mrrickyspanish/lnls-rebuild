-- "Rumors" is no longer a topic: Rumor is a label now.
-- Run AFTER supabase/add_piece_labels_and_notes.sql.
--
-- Labels every story filed under the old Rumors topic as a Rumor (unless it
-- already has a label). The topic itself is left alone: the editor shows it
-- as "Rumors (retired)" on those stories so you can pick the right one
-- (Lakers, NBA, Football...) next time you open each.
UPDATE articles
  SET article_type = 'rumor'
  WHERE topic = 'Rumors' AND article_type IS NULL;

-- To see which stories still need a new topic:
-- SELECT slug, title FROM articles WHERE topic = 'Rumors' ORDER BY created_at DESC;
