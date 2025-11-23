# LNLS Platform — Deployment Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 18+ installed
- GitHub account
- Vercel account (free tier works)
- Sanity account (free tier works)
- Supabase account (free tier works)
- Anthropic API key
- Resend account (free tier)
- YouTube API credentials
- Spreaker show ID (for podcast RSS)

---

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd lnls-platform

# Install dependencies
npm install
```

---

## Step 2: Sanity Setup

### Create Sanity Project
```bash
# Login to Sanity
npm install -g @sanity/cli
sanity login

# Initialize Sanity project (if needed)
sanity init

# Use existing project ID or create new one
# Copy project ID for next step
```

### Get API Token
1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to API → Tokens
4. Create new token with "Editor" permissions
5. Copy token for `.env`

### Deploy Sanity Studio
```bash
# Build and deploy studio
npm run studio:deploy
```

Your Sanity Studio will be available at: `https://lnls.sanity.studio/`

---

## Step 3: Supabase Setup

### Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "lnls-platform"
4. Save the project URL and anon key

### Run Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Copy contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. Verify tables were created in Table Editor

### Get API Keys
- Project URL: `https://[project-id].supabase.co`
- Anon Key: Found in Settings → API
- Service Role Key: Found in Settings → API (keep secret!)

---

## Step 4: External APIs

### Anthropic API
1. Go to https://console.anthropic.com/
2. Generate API key
3. Copy for `.env`

### Resend
1. Go to https://resend.com/
2. Create account and verify domain (or use test mode)
3. Generate API key
4. Copy for `.env`

### YouTube API
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable YouTube Data API v3
4. Create credentials → API Key
5. Get your channel ID from YouTube Studio

### Spreaker (Podcast)
1. Find your Spreaker show ID
2. Located in your show's RSS feed URL

---

## Step 5: Environment Variables

Create `.env.local` file in project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Fill in all values:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_write_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-key

# Resend
RESEND_API_KEY=re_your_key

# YouTube
YOUTUBE_API_KEY=your_youtube_key
YOUTUBE_CHANNEL_ID=your_channel_id

# Spreaker
SPREAKER_SHOW_ID=your_show_id

# Site Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 6: Local Development

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start Sanity Studio locally
npm run studio
```

- Next.js app: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio

---

## Step 7: Deploy to Vercel

### Connect GitHub
1. Push project to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/lnls-platform.git
git push -u origin main
```

### Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. Add Environment Variables:
   - Copy all variables from `.env.local`
   - Add them in Vercel → Settings → Environment Variables

5. Deploy!

### Quick Deployment Script

For subsequent deployments after initial setup, use the automated deployment script:

```bash
# Option 1: Run the script directly
./deploy.sh

# Option 2: Use npm script
npm run deploy
```

This script automatically:
1. Checks out main branch
2. Pulls latest code from origin/main
3. Installs dependencies with `npm ci`
4. Deploys to Vercel production with `vercel --prod`

**Prerequisites:**
- Vercel CLI installed globally: `npm install -g vercel`
- Authenticated with Vercel: `vercel login`
- Project linked to Vercel: `vercel link` (done automatically on first deployment)

---

## Step 8: Domain Setup

### Custom Domain
1. In Vercel, go to Settings → Domains
2. Add your domain (e.g., `lnls.media`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars

### Update Sanity CORS
1. Go to Sanity dashboard → API → CORS Origins
2. Add your Vercel domain: `https://yourdomain.com`
3. Save changes

---

## Step 9: Content Population

### Add First Author
1. Go to Sanity Studio (`/studio`)
2. Click "Authors" → Create new
3. Fill in name, bio, image, role
4. Publish

### Add First Article
1. Click "Articles" → Create new
2. Fill in title, slug, content
3. Select author
4. Add categories
5. Click "Generate Social Captions" (AI button)
6. Publish

### Sync Podcast Episodes
1. Set up Spreaker RSS feed
2. Manually create first episode in Sanity
3. Or use RSS sync (see Automation below)

---

## Step 10: Automation Setup

### Cron Jobs (Vercel)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/rss/aggregate",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

This runs news aggregation every 2 hours.

### Manual Triggers

#### Aggregate News
```bash
curl https://yourdomain.com/api/rss/aggregate
```

#### Sync YouTube
```bash
curl https://yourdomain.com/api/youtube/sync
```

---

## Step 11: Testing

### Test Newsletter Signup
1. Visit `/subscribe`
2. Enter test email
3. Check Supabase `newsletter_subscribers` table
4. Check email inbox for welcome message

### Test AI Generation
1. Create draft article in Sanity
2. Click AI assist buttons:
   - Generate Social Captions
   - Generate SEO Metadata
   - Generate Summary
3. Verify AI-generated content appears

### Test News Stream
1. Run RSS aggregator manually: `/api/rss/aggregate`
2. Check Supabase `news_stream` table
3. Refresh homepage to see news cards

---

## 🔧 Troubleshooting

### Sanity Studio not loading
- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` is correct
- Check CORS settings in Sanity dashboard
- Rebuild and redeploy: `npm run build`

### AI features not working
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API credits/quota in Anthropic dashboard
- Check Vercel function logs for errors

### Images not displaying
- Verify Sanity image URLs are working
- Check `next.config.js` has correct image domains
- Redeploy after changes

### Database errors
- Verify Supabase credentials are correct
- Check RLS policies are enabled
- Review Supabase logs for specific errors

---

## 📊 Post-Launch Checklist

- [ ] Domain connected and SSL active
- [ ] First 5 articles published
- [ ] Newsletter signup tested
- [ ] RSS aggregation running
- [ ] YouTube feed synced
- [ ] Social links updated in footer
- [ ] Analytics tracking verified
- [ ] SEO metadata reviewed
- [ ] Mobile responsive tested
- [ ] AI features tested

---

## 🎯 Next Steps

### Phase 2 Features
1. **Comments System**
   - Enable comments table in Supabase
   - Build moderation dashboard
   - Add comment components to articles

2. **Monetization**
   - Set up ad slots
   - Add affiliate tracking
   - Configure sponsorship forms

3. **Advanced AI**
   - Article → Audio conversion
   - Personalized recommendations
   - Auto-generated newsletters

4. **Mobile App**
   - React Native wrapper
   - Push notifications
   - Offline reading

---

## 📞 Support

For issues or questions:
- GitHub Issues: [your-repo]/issues
- Email: dev@lnls.media
- Documentation: /docs folder

---

## 🔐 Security Notes

- Never commit `.env.local` to GitHub
- Keep service role keys private
- Use environment variables in Vercel for secrets
- Enable RLS policies in Supabase
- Review API rate limits regularly

---

**Built with:** Next.js 15, Sanity, Supabase, Anthropic Claude, Vercel

**Maintained by:** LNLS Development Team
