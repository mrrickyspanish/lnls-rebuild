# LNLS Deployment Guide

Deploy Late Night Lake Show (LNLS) with the streamlined Next.js + Supabase stack.

## Prerequisites

- GitHub account
- Vercel account
- Supabase project (free tier works)
- Resend account (email delivery)
- Anthropic API key (if you plan to use AI helpers)
- Node.js 18+ installed locally

## 1. Fork & Clone

1. Fork this repo to your GitHub account.
2. Clone it locally: `git clone https://github.com/<you>/lnls-platform`.
3. Install dependencies: `npm install`.

## 2. Supabase Setup

1. Create a project at <https://supabase.com/dashboard>.
2. In **Settings → API**, copy the Project URL, `anon` key, and `service_role` key.
3. Run the SQL in `supabase-schema.sql` to provision tables, views, and policies.
4. Ensure `news_stream`, `articles`, and `newsletter_subscribers` allow read/write access via the provided policies.
5. (Optional) configure Storage buckets if you want to host hero images inside Supabase.

## 3. Environment Variables

Create `.env.local` from `.env.example` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=hello@lnls.media
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UC...
SPREAKER_RSS_URL=https://www.spreaker.com/show/.../episodes/feed
```

Add optional keys (Perplexity, etc.) as needed.

## 4. Verify Locally

```bash
npm run dev
```

Visit <http://localhost:3000>. The homepage should render Supabase-powered content plus podcast data from `/api/podcast/episodes`.

## 5. Deploy to Vercel

1. Push your repo to GitHub.
2. Import it into Vercel (<https://vercel.com/import>).
3. Provide the same environment variables in Project Settings → Environment Variables.
4. Deploy (Vercel runs `npm run build`).

## 6. Scheduled Jobs (Recommended)

Use Vercel Cron or any scheduler to hit automation endpoints:

- `POST /api/rss/aggregate` every 2 hours → refresh Lakers/NBA news
- `POST /api/youtube/sync` once per day → refresh videos grid

## 7. Newsletter (Resend)

1. Verify your sending domain in Resend and create an API key.
2. Update `RESEND_API_KEY` + `RESEND_FROM_EMAIL`.
3. Submit the `/subscribe` form to confirm subscribers appear in Supabase and emails deliver.

## 8. Final Checklist

- ✅ Supabase schema migrated & RLS policies active
- ✅ Environment vars configured locally + on Vercel
- ✅ Resend domain verified
- ✅ Anthropic key active (optional AI endpoints)
- ✅ Cron jobs scheduled for RSS + YouTube sync

## 9. Troubleshooting

| Symptom | Checks |
| --- | --- |
| Homepage empty | Confirm Supabase tables contain data and API keys load correctly |
| RSS aggregation fails | Ensure `SUPABASE_SERVICE_ROLE_KEY` is available to the server/cron |
| Newsletter emails missing | Verify Resend domain + logs, confirm sender email is verified |
| AI endpoints failing | Validate Anthropic key + quota |

---

Built with Next.js 15, Supabase, Anthropic Claude, Resend, and Vercel.
