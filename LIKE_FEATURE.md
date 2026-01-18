# Like Feature Migration Guide

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
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
```

## Features Implemented

✅ **LikeButton Component**
- Heart icon with smooth animations
- Particle effects on like/unlike
- Optimistic UI updates (instant feedback)
- localStorage tracking (prevents duplicate likes)
- Hover states and transitions

✅ **Like Counter**
- Displays next to view count in article metadata
- Shows ❤️ icon + formatted count
- Updates in real-time when user likes/unlikes

✅ **ShareBar Integration**  
- Like button positioned at the top of the floating ShareBar
- Consistent styling with share buttons
- Same backdrop blur and rounded design
- Mobile & desktop responsive

✅ **API Endpoint**
- `/api/articles/[slug]/like` (POST)
- Toggles like state (like/unlike)
- Returns updated count
- Race condition safe with database function

✅ **Best Practices**
- Client-side deduplication via localStorage
- Optimistic updates for instant feedback
- Database-level atomic operations
- Proper TypeScript typing
- Accessibility labels
- Error handling with rollback

## Testing Checklist

1. Run the SQL migration in Supabase
2. Restart your dev server
3. Visit any article page
4. Click the heart icon in the ShareBar (bottom right)
5. Verify the count increments
6. Refresh the page - like state should persist
7. Click again to unlike - count should decrement
8. Check localStorage: `localStorage.getItem('likedArticles')`

## Design Notes

**Desktop:** Heart button appears at the top of the ShareBar (fixed bottom-right)
**Mobile:** Same position - stacks above Twitter/Facebook/Link buttons
**Animation:** Heart fills with red, particle burst effect on like
**Counter:** Displays like count next to views in article metadata (under title)
