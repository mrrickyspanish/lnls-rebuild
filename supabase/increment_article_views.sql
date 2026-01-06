-- Supabase SQL: Atomic increment for article views
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE articles 
  SET views = views + 1 
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;