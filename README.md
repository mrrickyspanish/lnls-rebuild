# Late Night Lake Show — Full-Stack Platform

> Where Lakers fans stay up talking ball.

Modern NBA content hub built with Next.js, Supabase, and AI-powered automation.

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
| **CMS + Database** | Supabase (PostgreSQL) |
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
│   ├── supabase/         # Database client
│   └── ai/               # AI helper functions
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
```

- App: http://localhost:3000

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** — Full setup instructions
- **[API Documentation](docs/api.md)** — Endpoint reference
- **[Content Guide](docs/content.md)** — How to publish content
- **[AI Tools](docs/ai.md)** — Using AI features

---

# Next.js Image Configuration

## Remote Image Domains

This project uses Next.js Image Optimization with a **specific allowlist** of remote domains for security.

### Current Allowed Domains

The following domains are configured in `next.config.js`:

```js
images: {
  remotePatterns: [
    // Specific approved domains listed here
  ],
  domains: [
    // Legacy domain list
  ]
}
```

### Adding New Image Sources

If you need to load images from a new external domain:

1. Open `next.config.js`
2. Add the domain to `images.remotePatterns`:

```js
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'example.com',
  },
  // ... existing entries
]
```

3. Or add to legacy `domains` array:

```js
domains: ['example.com', ...existingDomains]
```

### Development vs Production

**Production (current setup):**
- Uses specific allowlist
- More secure
- Prevents unauthorized image sources

**Development wildcard (not recommended for prod):**
```js
remotePatterns: [
  {
    protocol: 'https',
    hostname: '**', // ⚠️ DO NOT use in production
  }
]
```

### Common Image Sources in This Project

- YouTube thumbnails: `i.ytimg.com`, `i3.ytimg.com`, etc.
- Supabase storage: Your Supabase domain
- Any CDN or image hosting services you use

### Troubleshooting

**Error: "hostname ... is not configured under images"**

→ Add the hostname to `next.config.js` as shown above, then restart dev server.

---

**Last Updated:** November 23, 2025  
**Config Location:** `/next.config.js`

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
SPREAKER_RSS_URL=
NEXT_PUBLIC_SITE_URL=
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

1. **Write** — Draft articles directly in Supabase or via the LNLS submission tools
2. **Generate** — Use AI tools for social posts, SEO
3. **Review** — Edit and approve
4. **Publish** — Auto-deploys to production
5. **Distribute** — Social captions ready to copy/paste

---

## 🎯 Roadmap

### Phase 1 ✅
- [x] Core website
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

<!-- Trigger redeploy: trivial update -->
