-- Every story gets one of four buckets as its topic: Court, Code, Culture, Life.
-- Old topics move to the bucket they belong to. The site already reads old
-- topics as their bucket, so this only makes the data match.
UPDATE articles SET topic = CASE
  WHEN topic IN ('Lakers', 'NBA', 'Football', 'Recruit Ready', 'Analysis', 'Rumors', 'FEATURED') THEN 'Court'
  WHEN topic = 'Tech' THEN 'Code'
  WHEN topic = 'Lifestyle' THEN 'Culture'
  WHEN topic = 'Home' THEN 'Life'
  ELSE topic
END
WHERE topic NOT IN ('Court', 'Code', 'Culture', 'Life');

-- The Life lane was briefly called "Home": move anyone who picked it.
UPDATE newsletter_subscribers
  SET lanes = array_replace(lanes, 'home', 'life')
  WHERE 'home' = ANY(lanes);

-- Check: every story should now be in one of the four.
SELECT topic, COUNT(*) FROM articles GROUP BY topic ORDER BY topic;
