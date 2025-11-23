# LNLS Setup Guide

## Overview
Late Night Lake Show now runs entirely on Next.js 15 + Supabase. Follow this guide to spin up the stack locally and understand the moving parts.

## 1. Clone & Install
```bash
git clone https://github.com/<you>/lnls-platform
cd lnls-platform
npm install
```

## 2. Configure Supabase
1. Create a new project at <https://supabase.com/dashboard>.
2. Run `supabase-schema.sql` via the SQL editor to create tables (`articles`, `news_stream`, `newsletter_subscribers`, etc.).
3. Confirm row-level security policies allow `select` for the `anon` role on public data tables.
4. Grab the Project URL, `anon` key, and `service_role` key from **Settings → API**.

## 3. Environment Variables
Copy the example file and fill in values:
```bash
cp .env.example .env.local
```
Key variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (optional AI endpoints)
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `YOUTUBE_API_KEY` + `YOUTUBE_CHANNEL_ID`
- `SPREAKER_RSS_URL`

## 4. Run the App
```bash
npm run dev
```
Visit <http://localhost:3000>. The homepage should show:
- Hero carousel fed by LNLS Supabase entries + podcast API
- Purple & Gold / Around the League rows derived from Supabase news_stream
- Newsletter + subscribe forms wired to Supabase + Resend

## 5. Data Sources
- **Supabase `articles`** — First-party LNLS stories powering hero slots and `/news/[slug]`.
- **Supabase `news_stream`** — Aggregated RSS + AI summaries surfaced site-wide.
- **Podcast API** (`/api/podcast/episodes`) — Wraps Spreaker RSS for playback and hero mixing.
- **YouTube Sync** (`/api/youtube/sync`) — Uses YouTube Data API to hydrate `/videos` and feed LNLS hero logic.

## 6. Automation Tips
- Run `POST /api/rss/aggregate` periodically to refresh Lakers/NBA coverage.
- Run `POST /api/youtube/sync` daily to keep video tiles current.
- Both endpoints expect `SUPABASE_SERVICE_ROLE_KEY` at runtime.

## 7. Troubleshooting
| Issue | Fix |
| --- | --- |
| Hero slots empty | Ensure at least three LNLS articles exist in Supabase with recent `published_at` values |
| Newsletter signup fails | Check Resend API key + verify sender domain |
| RSS aggregate errors | Confirm environment variables and Supabase tables exist |
| YouTube sync fails | Verify YouTube API key has Data API v3 enabled |

## 8. Next Steps
- Connect Vercel + set environment variables for production
- Schedule cron jobs for RSS + YouTube sync
- Keep Supabase data seeded with LNLS-owned content for the hero experience
