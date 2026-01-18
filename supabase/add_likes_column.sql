-- Add likes column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0 NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_likes ON articles(likes DESC);

-- Create function to increment/decrement likes
CREATE OR REPLACE FUNCTION increment_article_likes(article_slug TEXT, delta INTEGER)
RETURNS TABLE(new_likes INTEGER) AS $$
DECLARE
  current_likes INTEGER;
BEGIN
  -- Update and return the new like count
  UPDATE articles 
  SET likes = GREATEST(0, likes + delta)
  WHERE slug = article_slug
  RETURNING likes INTO current_likes;
  
  RETURN QUERY SELECT current_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_article_likes TO authenticated, anon;

COMMENT ON COLUMN articles.likes IS 'Number of likes/hearts this article has received';
COMMENT ON FUNCTION increment_article_likes IS 'Safely increment or decrement article likes by delta (1 or -1)';
