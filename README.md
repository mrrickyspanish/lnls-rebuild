# LNLS Rebuild

## Project Summary

LNLS (Late Night Lake Show) is a modern Lakers fan podcast and content platform featuring AI-powered content creation, social media integration, and automated publishing workflows. The rebuild focuses on creating a scalable, maintainable Next.js application with Sanity CMS, Supabase backend, and comprehensive AI pipeline integration.

## Color Palette

### Primary Colors
- **Purple**: `#552583` (Lakers Purple)
- **Gold**: `#FDB927` (Lakers Gold)
- **Black**: `#000000`
- **White**: `#FFFFFF`

### Secondary/Accent Colors
- **Dark Purple**: `#32174D`
- **Light Gold**: `#FDCD60`
- **Gray Scale**: `#F5F5F5`, `#E0E0E0`, `#757575`

## Typography Palette

### Font Families
- **Headings**: Inter, system-ui, sans-serif
- **Body**: Inter, system-ui, sans-serif
- **Code**: 'Fira Code', 'JetBrains Mono', monospace

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

## AI Pipeline Integration

### RSS Feed Processing
- Automated Lakers news aggregation from trusted sources
- AI-powered content summarization and categorization
- Duplicate detection and content deduplication
- Scheduled processing via cron jobs
- Content storage in Sanity CMS

### Social Media Caption Generation
- AI-generated captions for Instagram, Twitter/X, and Facebook
- Platform-specific formatting and character limits
- Hashtag optimization and trend integration
- Brand voice consistency enforcement
- Multi-variant generation for A/B testing

### YouTube to Article Conversion
- Automated transcript extraction from YouTube videos
- AI-powered article generation from transcripts
- SEO optimization and keyword extraction
- Featured image generation and selection
- Auto-publishing to CMS with proper metadata

### Podcast Notes Generation
- Episode transcript processing
- Key points and highlights extraction
- Timestamp generation for show notes
- Guest information and link extraction
- Chapter markers and navigation aids

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **CMS**: Sanity.io
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **AI Services**: OpenAI API, Claude API
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth

## Getting Started

For detailed setup instructions, see [Build Instructions](./docs/build_instructions.md).

For architecture details, see [Architecture Documentation](./docs/architecture.md).

For AI coding guidelines, see [AI Guidelines](./rules/ai_guidelines.md).

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mrrickyspanish/lnls-rebuild.git
cd lnls-rebuild

# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env.local)
cp .env.example .env.local

# Run development server
npm run dev
```

## Documentation

- [Build Instructions](./docs/build_instructions.md) - Step-by-step setup guide
- [Architecture](./docs/architecture.md) - Technical architecture and design decisions
- [AI Guidelines](./rules/ai_guidelines.md) - AI-specific coding standards and rules

## Contributing

This project follows strict AI guidelines and coding standards. Please review the documentation in `/docs` and `/rules` before contributing.

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.
