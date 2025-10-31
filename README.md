# Late Night Lake Show — Full-Stack Platform

> Where Lakers fans stay up talking ball.

Modern NBA content hub built with Next.js, Sanity CMS, Supabase, and AI-powered automation.

---

## 🏀 Features

### Content Management
- **Articles** — Rich text editor with MDX support
- **Podcast Episodes** — Auto-sync from Spreaker RSS
- **YouTube Integrations** — Automatic video feed updates
- **Multi-format Publishing** — Write once, distribute everywhere

### AI-Powered Tools
- **Auto News Aggregation** — RSS feeds + AI summarization
- **Social Caption Generator** — X, Instagram, LinkedIn posts
- **SEO Optimization** — AI-generated meta descriptions
- **Show Notes Generator** — Podcast transcripts → formatted notes

### User Features
- **Live News Stream** — Real-time Lakers & NBA updates
- **Newsletter System** — Daily email digests via Resend
- **Responsive Design** — Mobile-first, performant
- **Dark Mode** — Slate/neon color system

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Custom Design System |
| **CMS** | Sanity Studio (Headless) |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Anthropic Claude Sonnet 4.5 |
| **Email** | Resend |
| **Hosting** | Vercel |
| **Media** | YouTube API, Spreaker RSS |

---

## 📁 Project Structure

```
lnls-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (AI, RSS, newsletter)
│   ├── news/              # Article pages
│   ├── podcast/           # Episode pages
│   ├── videos/            # YouTube feed
│   ├── about/             # Team & info
│   └── subscribe/         # Newsletter signup
├── components/            # React components
├── lib/                   # Utilities & clients
│   ├── sanity/           # Sanity config & queries
│   ├── supabase/         # Database client
│   └── ai/               # AI helper functions
├── studio/               # Sanity Studio
│   └── schemas/          # Content models
├── styles/               # Global styles
└── public/               # Static assets
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Fill in your API keys and credentials
```

### 3. Start Development
```bash
# Next.js app
npm run dev

# Sanity Studio (in another terminal)
npm run studio
```

- App: http://localhost:3000
- Studio: http://localhost:3000/studio

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** — Full setup instructions
- **[API Documentation](docs/api.md)** — Endpoint reference
- **[Content Guide](docs/content.md)** — How to publish content
- **[AI Tools](docs/ai.md)** — Using AI features

---

## 🎨 Design System

### Color Palette
```css
--slate-base: #0F172A      /* Primary background */
--slate-secondary: #1E293B /* Card backgrounds */
--slate-muted: #64748B     /* Disabled text */
--neon-purple: #A78BFA     /* Primary accent */
--neon-gold: #FBBF24       /* Secondary accent */
--offwhite: #F1F5F9        /* Body text */
```

### Typography
- **Headings:** Bebas Neue (bold, uppercase)
- **Body:** Inter (clean, readable)

---

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run studio       # Start Sanity Studio locally
npm run studio:build # Build Sanity Studio
npm run studio:deploy # Deploy Studio to Sanity
```

---

## 🤖 AI Features

### Social Captions
Generate X, Instagram, and LinkedIn posts from article content.

```typescript
POST /api/ai/assist
{
  "action": "generateSocialCaptions",
  "data": {
    "title": "LeBron drops 40",
    "excerpt": "King James turns back the clock..."
  }
}
```

### News Aggregation
Automatically fetch, summarize, and publish Lakers news.

```bash
# Manual trigger
curl https://yourdomain.com/api/rss/aggregate
```

---

## 📊 Analytics

Built-in event tracking via Supabase:

```typescript
import { trackEvent } from '@/lib/supabase/client'

trackEvent('article_view', '/news/lebron-40-points', {
  articleId: 'abc123',
  category: 'game-recap'
})
```

---

## 🔐 Environment Variables

Required API keys:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
SANITY_API_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
YOUTUBE_API_KEY=
```

See `.env.example` for complete list.

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 📝 Content Workflow

1. **Write** — Draft articles in Sanity Studio
2. **Generate** — Use AI tools for social posts, SEO
3. **Review** — Edit and approve
4. **Publish** — Auto-deploys to production
5. **Distribute** — Social captions ready to copy/paste

---

## 🎯 Roadmap

### Phase 1 ✅
- [x] Core website
- [x] Sanity CMS integration
- [x] AI news aggregation
- [x] Newsletter system
- [x] YouTube feed

### Phase 2 🔄
- [ ] Comments system
- [ ] User accounts
- [ ] Monetization (ads, affiliates)
- [ ] Mobile app (React Native)

### Phase 3 📋
- [ ] Live streaming integration
- [ ] Advanced analytics dashboard
- [ ] Personalized recommendations
- [ ] Multi-language support

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md).

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Component-first architecture

---

## 📄 License

Copyright © 2024 Late Night Lake Show. All rights reserved.

---

## 📞 Contact

- **Website:** https://lnls.media
- **X/Twitter:** [@latenightlakeshow](https://twitter.com/latenightlakeshow)
- **Email:** hello@lnls.media
- **YouTube:** [@latenightlakeshow](https://youtube.com/@latenightlakeshow)

---

**Built by Lakers fans, for Lakers fans.** 💜💛
