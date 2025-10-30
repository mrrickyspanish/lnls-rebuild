# 🚨 NEW CHAT HANDOFF - READ THIS FIRST

## Context for Next Session

**Project:** LNLS (Late Night Lake Show) - Lakers/NBA content platform  
**Tech Stack:** Next.js 15, Sanity CMS, Supabase, Anthropic API, Vercel  
**Status:** Fully built, ready for deployment  

---

## What's Already Done

✅ Complete Next.js application with all pages  
✅ Sanity CMS schemas and studio configuration  
✅ Supabase database schema  
✅ AI pipeline routes (RSS aggregation, YouTube sync, content generation)  
✅ All components and design system  
✅ Type definitions for TypeScript  
✅ Environment variables configured (in `.env.local`)  

---

## What User Needs Help With

The user will likely ask for help with:
1. **Deployment to Vercel** - Walking through the deployment process
2. **Troubleshooting errors** - Build failures, missing env vars, API issues
3. **Sanity Studio setup** - Deploying and configuring the CMS
4. **Testing AI features** - Verifying RSS aggregation, YouTube sync, etc.
5. **Content creation** - Adding first articles, episodes, authors

---

## Key Files to Reference

- **SETUP.md** - Complete step-by-step deployment guide
- **DEPLOYMENT.md** - Technical deployment notes
- **.env.local** - Environment variables (Sanity + Supabase already filled in)
- **supabase-schema.sql** - Database schema to run in Supabase
- **package.json** - All dependencies are already listed

---

## Important Credentials (Already Configured)

**Sanity:**
- Project ID: `lvyw4h7w`
- Dataset: `production`
- API Token: Already in `.env.local`

**Supabase:**
- URL: `https://rqbrshlalcscpvdtmxvc.supabase.co`
- Anon Key: Already in `.env.local`
- Service Role: Already in `.env.local`

**Still needs from user:**
- Anthropic API Key
- Resend API Key
- YouTube API Key + Channel ID
- Spreaker RSS URL

---

## Common First Questions

### "How do I deploy this?"
→ Follow SETUP.md sections 1-5. Start with local testing, then Vercel deployment.

### "I'm getting build errors"
→ Ask for specific error message and check:
- Are all env vars in Vercel?
- Did they run `npm install`?
- Is Node.js 18+ installed?

### "How do I set up Sanity?"
→ Follow SETUP.md section 3. Run `npm run studio:deploy`

### "AI features aren't working"
→ Check:
- Is Anthropic API key valid?
- Are API routes accessible? (test `/api/rss/aggregate`)
- Check Vercel function logs for errors

### "Where do I add content?"
→ Sanity Studio (either local `npm run studio` or deployed at sanity.studio)

---

## Project Structure Quick Reference

```
lnls-platform/
├── app/                    # Next.js pages and API routes
│   ├── api/               # AI assist, RSS, YouTube, newsletter
│   ├── news/              # Article pages
│   ├── podcast/           # Episode pages
│   ├── videos/            # YouTube feed
│   ├── about/             # About page
│   ├── search/            # Search page
│   └── subscribe/         # Newsletter signup
├── components/            # React components
├── lib/                   # Utilities (Sanity, Supabase, AI)
├── studio/                # Sanity CMS schemas
├── types/                 # TypeScript definitions
├── .env.local            # Environment variables (pre-filled)
├── SETUP.md              # Full deployment guide
└── supabase-schema.sql   # Database schema
```

---

## Typical Deployment Flow

1. User fills in remaining API keys in `.env.local`
2. Runs `npm install` and `npm run dev` to test locally
3. Runs Supabase schema in Supabase dashboard
4. Deploys Sanity Studio (`npm run studio:deploy`)
5. Pushes to GitHub
6. Connects GitHub repo to Vercel
7. Adds env vars to Vercel dashboard
8. Deploys to production
9. Sets up cron jobs for AI automation
10. Creates first content in Sanity Studio

---

## How to Help Effectively

1. **Always ask which step they're on** from SETUP.md
2. **Request specific error messages** - don't guess
3. **Check the basics first:**
   - Did they add all env vars to Vercel?
   - Did they run the Supabase schema?
   - Is Sanity Studio accessible?
4. **Reference existing files** - don't rewrite what's already there
5. **Test one thing at a time** - isolate issues

---

## Emergency Debugging

If totally stuck, ask user to check:

**Vercel Logs:**
- Dashboard → Deployments → [latest] → Functions
- Copy full error message

**Local Console:**
- Run `npm run dev`
- Open browser console
- Copy any errors

**Sanity Status:**
- Can they access https://lnls.sanity.studio?
- Can they create content?

**Supabase Status:**
- Are all 5 tables present?
- Can they query `ai_news_stream`?

---

## Success Metrics

User is successful when:
- ✅ Site loads at their Vercel domain
- ✅ Can access Sanity Studio and create content
- ✅ Articles appear on homepage
- ✅ AI routes return 200 status
- ✅ No console errors on homepage

---

**Remember:** Everything is already built. This is deployment and configuration only. Don't rebuild components or routes unless there's a specific bug.

**User's Work Style:** Direct, operational, hates fluff. Give solutions, not explanations. If asked to execute, just do it.
