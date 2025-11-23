# Video Feed Strategy

## Canonical Source
- The `/videos` page **must** use the YouTube RSS feed via `lib/youtube-rss.ts#getYouTubeRSS`.
- Do **not** revert to Supabase/manual sync tables; those go stale and break the feed.
- Channel ID lives in `.env` (`YOUTUBE_CHANNEL_ID`).

## Rationale
- Matches the homepage hero allowlist (owned content only).
- Eliminates manual syncing and missing content when Supabase tables are empty.

## Implementation Notes
1. `app/videos/page.tsx` imports `getYouTubeRSS` and slices the latest 12 entries.
2. Each RSS item maps directly to the existing card props (`title`, `link`, `thumbnail`, `pubDate`).
3. Provide safe fallbacks for missing thumbnails or dates.

If future work requires additional metadata (views, duration, etc.), extend the RSS helper—do **not** switch data sources.
