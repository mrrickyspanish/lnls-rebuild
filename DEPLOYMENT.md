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
RESEND_FROM_EMAIL=The Daily Dribble <newsletter@thedailydribble.com>   # must be on a domain verified in Resend
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UC...
SPREAKER_RSS_URL=https://www.spreaker.com/show/.../episodes/feed
ADMIN_SIGNUP_CODE=            # 16+ chars. Only while creating admin accounts; see "Admin access".
CRON_SECRET=                  # 16+ chars. Required for the hourly RSS cron to be accepted.
```

Add optional keys (Perplexity, etc.) as needed.

## Admin access

`/admin` and every admin-only API route require a real Supabase account that has an active row in `public.admin_profiles`. There is no shared password. This is the same model as the clw-wizards admin.

**One-time setup**

1. In the Supabase SQL Editor for this project, run `supabase/add_admin_accounts.sql`.
2. In Vercel (Project Settings, Environment Variables, Production and Preview) set:
   - `ADMIN_SIGNUP_CODE`: any 16+ character secret.
   - `CRON_SECRET`: any 16+ character secret. Vercel then sends it to the cron route automatically.
3. Redeploy (environment variable changes only apply to new deployments).
4. Open `/admin-signup`, enter your name, email, a 12+ character password, and the access code. Then sign in at `/login`.
5. Once every person who needs admin has an account, **delete `ADMIN_SIGNUP_CODE` and redeploy**. Sign-up is closed whenever the variable is unset or shorter than 16 characters.

**Lost a password?** In Supabase, Authentication, Users, open the user and send a recovery email or set a new password. To add another admin later, set `ADMIN_SIGNUP_CODE` again, have them use `/admin-signup`, then remove it.

**What is protected:** `/admin/*` (middleware), plus `POST /api/upload`, `POST /api/ai/assist`, `POST /api/articles/submit`, `PATCH|DELETE /api/articles/[slug]`, `PATCH /api/articles/[slug]/status` and `POST /api/newsletter/send` (each calls `requireAdmin()`). `/api/rss/aggregate` and `/api/youtube/sync` accept either the cron secret or an admin session. Public routes (like, view tracking, newsletter subscribe and unsubscribe, podcast feed) are intentionally open.

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
