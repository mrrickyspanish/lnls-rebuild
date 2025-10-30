# LNLS Platform - Setup & Deployment Guide

## 🚀 Quick Start

This guide walks you through deploying the LNLS platform from scratch. Follow each section in order.

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] All API credentials (see `.env.local` file)

---

## 1️⃣ Local Setup

### Clone & Install

```bash
# Extract the archive
tar -xzf lnls-platform-updated.tar.gz
cd lnls-platform

# Install dependencies
npm install

# Copy environment variables
# The .env.local file is already in the repo with your Sanity + Supabase credentials
# Just add the remaining API keys (Anthropic, Resend, YouTube, Spreaker)
```

### Add Missing Credentials

Open `.env.local` and fill in:

1. **Anthropic API Key**
   - Get from: https://console.anthropic.com
   - Navigate to: Settings → API Keys → Create Key
   - Replace: `ANTHROPIC_API_KEY=your_anthropic_api_key_here`

2. **Resend API Key**
   - Get from: https://resend.com/api-keys
   - Create API Key
   - Replace: `RESEND_API_KEY=your_resend_api_key_here`
   - Also verify: `RESEND_FROM_EMAIL=hello@lnls.media` (or your domain)

3. **YouTube API Key**
   - Get from: https://console.cloud.google.com
   - Enable YouTube Data API v3
   - Create Credentials → API Key
   - Replace: `YOUTUBE_API_KEY=your_youtube_api_key_here`
   - Replace: `YOUTUBE_CHANNEL_ID=your_youtube_channel_id_here`

4. **Spreaker RSS URL**
   - Get from your Spreaker show dashboard
   - Replace: `SPREAKER_RSS_URL=https://www.spreaker.com/show/[your-id]/episodes/feed`

---

## 2️⃣ Supabase Database Setup

### Run the Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/rqbrshlalcscpvdtmxvc
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` from the repo
5. Paste into the query editor
6. Click **Run**

This creates all necessary tables:
- `profiles` (user accounts)
- `comments` (article comments)
- `analytics_events` (page views, clicks)
- `newsletter_subscribers` (email list)
- `ai_news_stream` (auto-aggregated news)

### Verify Tables

In Supabase dashboard:
- Go to **Table Editor**
- You should see all 5 tables listed

---

## 3️⃣ Sanity Studio Setup

### Initialize Sanity

```bash
# Login to Sanity (if not already)
npx sanity login

# The project is already configured with your credentials
# Just verify the sanity.config.ts file has:
# projectId: 'lvyw4h7w'
# dataset: 'production'
```

### Deploy Sanity Studio

```bash
# Build the studio
npm run studio:build

# Deploy to Sanity hosting (optional but recommended)
npm run studio:deploy
```

This gives you a hosted CMS at: `https://lnls.sanity.studio/`

### Access Sanity Studio

You can also run it locally:

```bash
npm run studio
```

Then open: http://localhost:3333

---

## 4️⃣ Test Locally

```bash
# Start the Next.js dev server
npm run dev
```

Open: http://localhost:3000

### Test Checklist

- [ ] Homepage loads
- [ ] Can navigate to `/news`, `/podcast`, `/videos`, `/about`, `/search`, `/subscribe`
- [ ] Sanity Studio is accessible (locally or deployed)
- [ ] No console errors related to missing env variables

---

## 5️⃣ Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: lnls-platform
# - Directory: ./
# - Want to override settings? No
```

### Option B: Deploy via GitHub + Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial LNLS platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/lnls-platform.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to: https://vercel.com/new
   - Click **Import Git Repository**
   - Select your `lnls-platform` repo
   - Click **Import**

3. **Add Environment Variables:**
   - In Vercel dashboard, go to: **Settings → Environment Variables**
   - Copy ALL variables from your `.env.local` file
   - Add each one (make sure to select all environments: Production, Preview, Development)
   - Click **Save**

4. **Deploy:**
   - Click **Deploy**
   - Wait for build to complete (~2-3 minutes)

---

## 6️⃣ Post-Deployment Setup

### Configure Domain

1. In Vercel dashboard, go to: **Settings → Domains**
2. Add your custom domain: `lnls.media`
3. Follow DNS configuration instructions
4. Update `.env.local` and Vercel env:
   ```
   NEXT_PUBLIC_SITE_URL=https://lnls.media
   ```

### Set Up Cron Jobs (AI Automation)

The AI pipelines need to run periodically. Use Vercel Cron or external service:

#### Option A: Vercel Cron (Recommended)

Create `vercel.json` in root:

```json
{
  "crons": [
    {
      "path": "/api/rss/aggregate",
      "schedule": "0 */2 * * *"
    },
    {
      "path": "/api/youtube/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs:
- RSS aggregation: Every 2 hours
- YouTube sync: Every 6 hours

Push to GitHub and redeploy.

#### Option B: External Cron Service

Use https://cron-job.org or similar:
- Add job: `https://lnls.media/api/rss/aggregate` (every 2 hours)
- Add job: `https://lnls.media/api/youtube/sync` (every 6 hours)

### Configure Resend Domain

1. Go to: https://resend.com/domains
2. Add domain: `lnls.media`
3. Add DNS records (SPF, DKIM, DMARC)
4. Verify domain
5. Update env: `RESEND_FROM_EMAIL=hello@lnls.media`

---

## 7️⃣ Create First Content

### Add an Author

1. Go to Sanity Studio
2. Click **Authors** → **Create New**
3. Fill in:
   - Name
   - Slug (auto-generated)
   - Bio
   - Image (upload or skip)
   - Social links
4. Click **Publish**

### Write an Article

1. In Sanity Studio, click **Articles** → **Create New**
2. Fill in:
   - Title
   - Slug (auto-generated)
   - Excerpt
   - Main Image
   - Body (rich text editor)
   - Author (select from dropdown)
   - Categories/Tags
3. Click **Publish**

Article is now live at: `https://lnls.media/news/[slug]`

### Add a Podcast Episode

1. In Sanity Studio, click **Episodes** → **Create New**
2. Fill in:
   - Title
   - Episode number / Season
   - Description
   - Audio URL (from Spreaker)
   - YouTube URL (if available)
   - Show notes
3. Click **Publish**

Episode is now live at: `https://lnls.media/podcast/[slug]`

---

## 8️⃣ Test AI Features

### Test AI Assistant

```bash
curl -X POST https://lnls.media/api/ai/assist \
  -H "Content-Type: application/json" \
  -d '{
    "action": "summarize",
    "content": "Your article text here...",
    "context": { "title": "Test Article" }
  }'
```

### Test RSS Aggregation

Visit: `https://lnls.media/api/rss/aggregate`

This will:
- Fetch latest Lakers/NBA news from 6 RSS sources
- Summarize with AI
- Store in Supabase `ai_news_stream` table

### Test YouTube Sync

Visit: `https://lnls.media/api/youtube/sync`

This will:
- Fetch latest videos from your YouTube channel
- Generate articles or episode drafts
- Store in Sanity (as drafts for review)

---

## 9️⃣ Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Check Vercel dashboard: Settings → Environment Variables
- Ensure all variables from `.env.local` are added
- Redeploy

**Error: Module not found**
- Run `npm install` locally
- Commit `package-lock.json`
- Push and redeploy

### API Routes Return 500

**Check Vercel Logs:**
- Go to: Deployments → [latest] → Functions
- Click on failing function
- Check logs for specific error

**Common issues:**
- Invalid API keys
- Missing permissions (check Sanity token has Editor role)
- Supabase tables not created (run schema again)

### Sanity Studio Won't Load

- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` matches: `lvyw4h7w`
- Verify `NEXT_PUBLIC_SANITY_DATASET` is: `production`
- Check Sanity dashboard for project status

### YouTube Sync Not Working

- Verify YouTube API is enabled in Google Cloud Console
- Check API key has YouTube Data API v3 permissions
- Verify channel ID is correct

---

## 🎉 You're Live!

Your LNLS platform is now deployed and running. Here's what's automated:

✅ **AI News Stream** - Auto-aggregates Lakers/NBA news every 2 hours  
✅ **YouTube Sync** - Auto-creates content from new videos every 6 hours  
✅ **Social Captions** - Generate captions for every article in Sanity  
✅ **SEO Metadata** - AI generates meta tags for all content  
✅ **Newsletter** - Subscribers stored in Supabase  

---

## 📚 Next Steps

1. **Customize Content:**
   - Update About page with your team info
   - Add your logo and brand assets
   - Customize colors in `tailwind.config.js`

2. **Enable Comments:**
   - Implement auth flow (Supabase Auth)
   - Add comment components to article pages

3. **Add Analytics:**
   - Vercel Analytics is already enabled
   - Consider adding Google Analytics or Plausible

4. **Monetization:**
   - Add ad slots in components
   - Set up affiliate links
   - Create membership tiers

5. **Mobile App:**
   - Consider React Native wrapper
   - Add push notifications for new content

---

## 🆘 Need Help?

If you run into issues during deployment, start a new chat with Claude and say:

**"I'm deploying the LNLS platform and hitting [specific error]. The repo is at [location] and I've completed steps 1-X from SETUP.md."**

Include:
- Exact error message
- Which step you're on
- Vercel deployment logs (if applicable)

---

**Built with:** Next.js 15, Sanity CMS, Supabase, Anthropic Claude API, Vercel  
**Version:** 1.0.0  
**Last Updated:** October 29, 2025
