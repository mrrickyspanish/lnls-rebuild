# Architecture Documentation

## Project Overview

LNLS Rebuild is a modern Next.js application designed for the Late Night Lake Show podcast platform, featuring AI-powered content creation, social media integration, and automated publishing workflows.

## Site Map

### Public Pages
- `/` - Homepage with latest episodes and Lakers news
- `/episodes` - Episode archive with search and filtering
- `/episodes/[slug]` - Individual episode pages
- `/news` - Lakers news aggregation page
- `/news/[slug]` - Individual news article pages
- `/about` - About the show and hosts
- `/contact` - Contact information and social links
- `/search` - Global search across content

### Admin/CMS Pages
- `/studio` - Sanity Studio (if integrated)
- `/api/*` - API routes for data fetching and AI processing

### AI Processing Pages
- `/api/rss/process` - RSS feed processing endpoint
- `/api/ai/captions` - Social media caption generation
- `/api/ai/articles` - YouTube to article conversion
- `/api/ai/notes` - Podcast notes generation

## Technical Stack

| Component | Technology | Purpose |
|-----------|------------|----------|
| **Frontend Framework** | Next.js 14+ (App Router) | React-based web application |
| **Content Management** | Sanity.io | Headless CMS for content editing |
| **Database** | Supabase (PostgreSQL) | User data, analytics, caching |
| **Authentication** | Supabase Auth | User management and sessions |
| **Hosting & Deployment** | Vercel | Static site generation and serverless functions |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **AI Services** | OpenAI API, Claude API | Content generation and processing |
| **RSS Processing** | Custom Node.js scripts | News aggregation and parsing |
| **Media Storage** | Sanity Assets / Cloudinary | Images, audio files, video thumbnails |
| **Analytics** | Vercel Analytics / Google Analytics | User behavior tracking |
| **Search** | Algolia / Built-in search | Content discovery |
| **Email** | SendGrid / Resend | Contact forms and notifications |

## AI Module Descriptions

### 1. RSS Feed Processor (`/lib/ai/rss-processor.js`)

**Purpose**: Automatically aggregates and processes Lakers news from trusted sources

**Key Features**:
- Multi-source RSS feed aggregation
- Duplicate content detection using content hashing
- AI-powered summarization and categorization
- Sentiment analysis for trade rumors vs. confirmed news
- Auto-tagging with Lakers players, coaches, and topics

**Processing Flow**:
1. Fetch RSS feeds from configured sources
2. Parse and normalize content structure
3. Check for duplicates against existing content
4. Generate AI summary and extract key points
5. Categorize content (News, Trade Rumors, Game Recaps, etc.)
6. Store in Sanity CMS with proper metadata

**Scheduled Execution**: Every 30 minutes via Vercel Cron

### 2. Social Caption Generator (`/lib/ai/caption-generator.js`)

**Purpose**: Creates platform-specific social media captions for content promotion

**Key Features**:
- Platform-specific formatting (Instagram, Twitter/X, Facebook)
- Character limit compliance
- Hashtag optimization based on trending Lakers topics
- Brand voice consistency using prompt templates
- A/B testing variants generation

**Input Sources**:
- New episodes
- News articles
- Special announcements
- Game day content

**Output Formats**:
- Instagram: Visual-focused, emoji-rich, story-friendly
- Twitter/X: Concise, hashtag-optimized, thread-capable
- Facebook: Longer-form, discussion-prompting

### 3. YouTube to Article Converter (`/lib/ai/youtube-converter.js`)

**Purpose**: Transforms YouTube video content into readable blog articles

**Key Features**:
- Automatic transcript extraction via YouTube API
- AI-powered article structuring and formatting
- SEO optimization with keyword extraction
- Featured image generation from video thumbnails
- Auto-publishing pipeline to CMS

**Processing Steps**:
1. Extract transcript from YouTube video
2. Clean and structure transcript data
3. Generate article outline and sections
4. Create engaging title and meta description
5. Extract quotes and key moments
6. Generate or select featured image
7. Publish to Sanity with proper categories and tags

### 4. Podcast Notes Generator (`/lib/ai/notes-generator.js`)

**Purpose**: Creates comprehensive episode show notes and highlights

**Key Features**:
- Transcript processing and timestamp generation
- Key topics and discussion points extraction
- Guest information and link compilation
- Chapter markers for easy navigation
- Quote extraction for social sharing

**Generated Content**:
- Episode summary
- Key discussion topics with timestamps
- Guest bio and links (when applicable)
- Related links and references
- Quotable moments for social media
- Chapter markers for podcast players

## MVP Feature Checklist

### Core Functionality
- [x] Basic Next.js application setup
- [ ] Sanity CMS integration and schema design
- [ ] Supabase database setup and authentication
- [ ] Responsive design with Lakers branding
- [ ] Episode listing and detail pages
- [ ] News aggregation display
- [ ] Search functionality
- [ ] Contact forms

### AI Pipeline
- [ ] RSS feed processing automation
- [ ] Social media caption generation
- [ ] YouTube to article conversion
- [ ] Podcast notes generation
- [ ] Content categorization and tagging
- [ ] Duplicate detection system

### Admin Features
- [ ] Sanity Studio integration
- [ ] Content preview and publishing workflow
- [ ] AI-generated content review interface
- [ ] Analytics dashboard
- [ ] User management (if needed)

### Performance & SEO
- [ ] Static site generation for public pages
- [ ] Image optimization and lazy loading
- [ ] Meta tags and Open Graph implementation
- [ ] Sitemap generation
- [ ] Core Web Vitals optimization
- [ ] Progressive Web App features

### Deployment & Monitoring
- [ ] Vercel deployment configuration
- [ ] Environment variables setup
- [ ] Error monitoring (Sentry integration)
- [ ] Performance monitoring
- [ ] Automated testing pipeline
- [ ] Backup and recovery procedures

## Team Workflow

### Development Workflow
1. **Feature Branch Creation**: Create feature branches from `main`
2. **Local Development**: Develop and test locally with `.env.local`
3. **Preview Deployment**: Push to GitHub triggers Vercel preview deployment
4. **Code Review**: Create pull request for team review
5. **Production Deployment**: Merge to `main` triggers production deployment

### Content Workflow
1. **Automated Ingestion**: AI processes RSS feeds and creates draft content
2. **Content Review**: Team reviews AI-generated summaries and captions
3. **Manual Editing**: Edit and refine content in Sanity Studio
4. **Content Publishing**: Publish approved content to live site
5. **Social Promotion**: Use AI-generated captions for social media

### AI Monitoring Workflow
1. **Daily Review**: Check AI-generated content quality
2. **Feedback Integration**: Update prompts based on output quality
3. **Performance Monitoring**: Track AI API usage and costs
4. **Error Handling**: Monitor and resolve AI processing failures

## Edge Cases and Error Handling

### RSS Feed Processing
- **Feed Unavailable**: Implement retry logic with exponential backoff
- **Malformed XML**: Parse with error handling and logging
- **Rate Limiting**: Implement proper delays between source requests
- **Content Duplication**: Use content hashing to detect near-duplicates
- **AI API Failures**: Fallback to basic content processing without AI enhancement

### Social Media Generation
- **Character Limit Exceeded**: Implement automatic truncation with preservation of key information
- **Hashtag Saturation**: Limit hashtag count and prioritize most relevant ones
- **Brand Voice Inconsistency**: Implement content validation against brand guidelines
- **Platform API Changes**: Monitor for social platform API updates and adapt accordingly

### YouTube Processing
- **Private/Deleted Videos**: Handle gracefully with appropriate error messages
- **No Transcript Available**: Implement audio-to-text fallback using Whisper API
- **Copyright Issues**: Implement content filtering and fair use guidelines
- **Long Video Processing**: Implement chunking for videos over 2 hours

### Database and Performance
- **Supabase Connection Issues**: Implement connection pooling and retry logic
- **Large Content Processing**: Implement pagination and lazy loading
- **Search Performance**: Implement search result caching and indexing
- **Image Loading**: Implement progressive loading and WebP format optimization

### Security Considerations
- **API Key Exposure**: Ensure all sensitive keys are in environment variables
- **Input Validation**: Sanitize all user inputs and AI-generated content
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **Content Moderation**: Implement automated content filtering for inappropriate material

## Scalability Considerations

### Current Architecture Limitations
- Vercel function timeout limits (10 seconds hobby, 60 seconds pro)
- Sanity API rate limits (10 requests/second)
- OpenAI API rate limits and costs
- Supabase database connection limits

### Future Scalability Solutions
- **Background Jobs**: Implement queue system for long-running AI tasks
- **CDN Integration**: Use Cloudflare or similar for global content delivery
- **Database Sharding**: Implement if user base exceeds Supabase limits
- **Multi-AI Provider**: Implement failover between OpenAI, Claude, and others
- **Caching Strategy**: Implement Redis for frequently accessed data

## Monitoring and Analytics

### Application Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Custom Metrics**: AI processing success rates and response times
- **Uptime Monitoring**: External service monitoring for availability

### Content Analytics
- **Google Analytics**: User behavior and content performance
- **Social Media Analytics**: Track performance of AI-generated captions
- **SEO Monitoring**: Track search rankings for AI-generated articles
- **Engagement Metrics**: Track user interaction with different content types

## Backup and Recovery

### Data Backup Strategy
- **Sanity Content**: Automatic backup via Sanity's built-in versioning
- **Supabase Database**: Regular automated backups via Supabase
- **Environment Configuration**: Document all environment variables and configurations
- **Code Repository**: GitHub serves as primary code backup

### Disaster Recovery Plan
1. **Service Outage**: Monitor and communicate via status page
2. **Data Loss**: Restore from most recent backup within 24 hours
3. **Security Breach**: Immediate key rotation and security audit
4. **AI Service Outage**: Fallback to manual content creation workflow
