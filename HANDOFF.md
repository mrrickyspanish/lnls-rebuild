# LNLS Handoff Notes

## Project Snapshot
- **Stack:** Next.js 15 (App Router) + Supabase + Tailwind + Resend + Anthropic.
- **Content Sources:** Supabase `articles` table (first-party stories), `news_stream` (AI summaries of RSS), podcast RSS (Spreaker), YouTube API.
- **Automation:** `/api/rss/aggregate` and `/api/youtube/sync` endpoints keep feeds fresh. Both expect `SUPABASE_SERVICE_ROLE_KEY`.

## Key Paths
```
app/
  page.tsx                 // Homepage hero + rows (Supabase only)
  news/[slug]/page.tsx     // Article detail (Supabase)
  api/rss/aggregate        // RSS ingestion + AI summaries
  api/youtube/sync         // YouTube ingest pipeline
components/
  home/                    // Hero + content rows
lib/
  supabase/                // Client + helpers
  ai/                      // Anthropic integration
styles/globals.css         // Tailwind base theme
```

## Environment Variables
See `.env.example`. Critical ones:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `YOUTUBE_API_KEY` + `YOUTUBE_CHANNEL_ID`
- `SPREAKER_RSS_URL`
- `NEXT_PUBLIC_SITE_URL`

## Content Workflow
1. Editors create/update stories directly inside Supabase (or via internal tools) ensuring `source = 'LNLS'` and recent `published_at` for hero visibility.
2. Aggregator hits `/api/rss/aggregate` every 2 hours to pull external Lakers/NBA headlines with AI summaries saved to `news_stream`.
3. Podcast + YouTube tasks run on schedule for multimedia rows.
4. Newsletter form writes to Supabase then sends welcome email via Resend.

## Operational Checklist
- Supabase tables migrated (use `supabase-schema.sql`).
- Cron jobs scheduled for RSS + YouTube endpoints.
- Resend domain verified.
- Anthropic key live if AI tooling is needed.
- Vercel project configured with the same env vars as `.env.local`.

## Support
- **Engineering:** dev@lnls.media
- **Product:** ops@lnls.media
- **Emergency:** Slack #lnls-ops

Stay focused on keeping Supabase datasets fresh—every surface (hero, Purple & Gold, Around the League, search) now derives from that single source of truth.
