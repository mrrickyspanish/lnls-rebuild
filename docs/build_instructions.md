# Build Instructions

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm** or **yarn**: Latest stable version
- **Git**: For version control
- **Code Editor**: VS Code recommended

## Step 1: Repository Setup

### Clone the Repository

```bash
git clone https://github.com/mrrickyspanish/lnls-rebuild.git
cd lnls-rebuild
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 2: Sanity CMS Setup

### Create a Sanity Project

1. Go to [sanity.io](https://www.sanity.io/)
2. Sign in or create an account
3. Create a new project
4. Note your **Project ID** and **Dataset name** (usually 'production')

### Configure Sanity Studio

1. Navigate to the Sanity studio directory (if separate)
2. Install Sanity CLI globally:

```bash
npm install -g @sanity/cli
```

3. Initialize or configure your Sanity project:

```bash
sanity init
```

### Deploy Sanity Studio

```bash
sanity deploy
```

Your studio will be available at `https://your-project.sanity.studio`

## Step 3: Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Project name: `lnls-rebuild`
   - Database password: (generate a strong password)
   - Region: Choose closest to your users

### Get Supabase Credentials

1. Navigate to Project Settings → API
2. Copy the following:
   - **Project URL**
   - **Anon/Public Key**
   - **Service Role Key** (keep this secret!)

### Set Up Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Run initial schema migrations (if available in `/supabase/migrations`)
3. Set up Row Level Security (RLS) policies as needed

## Step 4: Environment Variables Configuration

### Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### Configure Required Variables

Edit `.env.local` with your credentials:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_claude_api_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTPUBLIC_APP_ENV=development
```

### Additional Optional Variables

```env
# RSS Feed Sources
RSS_FEED_URLS=url1,url2,url3

# Social Media APIs (if applicable)
TWITTER_API_KEY=your_key
INSTAGRAM_ACCESS_TOKEN=your_token

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Step 5: Vercel Deployment Setup

### Install Vercel CLI

```bash
npm install -g vercel
```

### Link Project to Vercel

```bash
vercel link
```

Follow the prompts to:
- Select or create a Vercel project
- Link to your GitHub repository

### Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from your `.env.local` file
3. Set appropriate environment scopes (Production, Preview, Development)

### Deploy to Vercel

```bash
vercel --prod
```

Or push to your main branch for automatic deployment (if GitHub integration is set up)

## Step 6: Quickstart Script (Optional)

If a quickstart script is available, run:

```bash
npm run setup
```

This may automate:
- Environment variable checking
- Database migrations
- Initial data seeding
- Dependency verification

## Step 7: Development Server

### Start Local Development

```bash
npm run dev
# or
yarn dev
```

Your app will be available at `http://localhost:3000`

### Start Sanity Studio Locally (if separate)

```bash
cd studio
npm run dev
```

Studio will be available at `http://localhost:3333`

## Step 8: Testing the Setup

### Verify Connections

1. **Sanity CMS**: Navigate to `/studio` (or external studio URL) and verify content editing works
2. **Supabase**: Test authentication and database queries
3. **AI Services**: Run a test AI generation task
4. **Frontend**: Browse the site and verify all pages load

### Run Tests (if available)

```bash
npm run test
# or
npm run test:e2e
```

## Deployment Notes

### Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] Sanity Studio deployed and accessible
- [ ] Supabase RLS policies properly configured
- [ ] API rate limits configured
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active
- [ ] Analytics tracking verified
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Backup strategy implemented

### Post-Deployment

1. **Monitor Logs**: Check Vercel and Supabase logs for errors
2. **Test AI Pipelines**: Verify RSS processing, caption generation, etc.
3. **Verify Cron Jobs**: Ensure scheduled tasks are running
4. **Check Performance**: Run Lighthouse audits
5. **Test on Multiple Devices**: Ensure responsive design works

### Continuous Deployment

Once GitHub integration is configured:
- Push to `main` branch → automatic production deployment
- Push to feature branches → automatic preview deployments
- Pull requests → automatic preview URLs generated

## Common Issues and Troubleshooting

### Issue: Module Not Found

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: Environment Variables Not Loading

- Ensure `.env.local` is in project root
- Restart development server after changes
- Check variable names match exactly
- Verify `NEXT_PUBLIC_` prefix for client-side variables

### Issue: Sanity Connection Errors

- Verify Project ID and Dataset name
- Check API token has correct permissions
- Ensure CORS settings in Sanity dashboard allow your domain

### Issue: Supabase Authentication Fails

- Verify Supabase URL and keys
- Check RLS policies aren't blocking access
- Ensure service role key is used for server-side operations

### Issue: Build Fails on Vercel

- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure environment variables are set in Vercel
- Check Node.js version compatibility

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Project Architecture](./architecture.md)
- [AI Guidelines](../rules/ai_guidelines.md)

## Getting Help

If you encounter issues:

1. Check this documentation thoroughly
2. Review error logs carefully
3. Search existing GitHub issues
4. Create a new issue with:
   - Detailed error description
   - Steps to reproduce
   - Environment details
   - Relevant logs/screenshots
