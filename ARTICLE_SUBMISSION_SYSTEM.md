# Article Submission System Documentation

Complete documentation for a production-ready article submission and management system built with Next.js 15, Supabase, and TipTap editor.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [File Structure](#file-structure)
5. [Core Components](#core-components)
6. [API Routes](#api-routes)
7. [Rich Text Editor](#rich-text-editor)
8. [Implementation Guide](#implementation-guide)
9. [Features](#features)
10. [Usage Examples](#usage-examples)

---

## System Overview

This is a complete content management system (CMS) for creating, editing, and publishing articles with:
- Rich text editing with TipTap (WYSIWYG editor)
- Image, GIF, and video embedding (YouTube, Vimeo, Streamable)
- SEO-friendly slugs
- Author management
- Topic categorization
- Featured article support
- View tracking
- Like functionality
- Supabase backend with Row-Level Security

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **TipTap** - Rich text editor (based on ProseMirror)

### Backend
- **Supabase** - PostgreSQL database, authentication, and RLS
- **Next.js API Routes** - Serverless API endpoints

### Key Dependencies
```json
{
  "@tiptap/react": "^3.11.0",
  "@tiptap/starter-kit": "^3.11.0",
  "@tiptap/extension-image": "^3.11.0",
  "@tiptap/extension-link": "^3.11.0",
  "@tiptap/extension-underline": "^3.11.0",
  "@tiptap/extension-placeholder": "^3.11.0",
  "@tiptap/extension-text-align": "^3.11.0",
  "@supabase/supabase-js": "^2.45.4"
}
```

---

## Database Schema

### Articles Table

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  image_credit TEXT,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_twitter TEXT,
  read_time INTEGER NOT NULL DEFAULT 5,
  topic TEXT NOT NULL,
  body JSONB NOT NULL,
  video_url TEXT,
  published BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published, published_at DESC);
CREATE INDEX idx_articles_topic ON articles(topic);
CREATE INDEX idx_articles_featured ON articles(featured) WHERE featured = TRUE;
```

### Row-Level Security (RLS)

```sql
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read access to published articles
CREATE POLICY "Allow public read access to published articles"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Service role has full access (for API routes)
CREATE POLICY "Allow service role full access to articles"
ON public.articles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### View Increment Function

```sql
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles 
  SET views = views + 1 
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;
```

---

## File Structure

```
app/
├── admin/
│   ├── layout.tsx              # Admin layout wrapper
│   ├── page.tsx                # Admin dashboard (article list)
│   └── submit/
│       ├── page.tsx            # New article submission page
│       └── [slug]/
│           └── page.tsx        # Edit existing article
│
├── api/
│   └── articles/
│       ├── submit/
│       │   └── route.ts        # POST: Create new article
│       └── [slug]/
│           └── route.ts        # PATCH: Update, DELETE: Delete
│
components/
├── admin/
│   ├── ArticleForm.tsx         # Main form component (create/edit)
│   └── RichTextEditor.tsx      # TipTap rich text editor
│
lib/
├── articles/
│   ├── body.ts                 # Body validation & normalization
│   └── index.ts                # Article utilities
│
├── supabase/
│   ├── articles.ts             # Database queries for articles
│   └── client.ts               # Supabase client instances
│
├── tiptap/
│   └── video-extension.ts      # Custom TipTap video embed extension
│
├── slug.ts                      # Slug generation utility
│
types/
└── supabase.ts                  # TypeScript database types
```

---

## Core Components

### 1. ArticleForm Component
**Location:** `/components/admin/ArticleForm.tsx`

The main form component that handles both creating and editing articles.

**Props:**
```typescript
interface ArticleFormProps {
  initialData?: Article      // For edit mode
  mode: 'create' | 'edit'   // Determines behavior
}
```

**Key Features:**
- Form validation
- Automatic slug generation from title
- TipTap editor integration
- Featured article toggle
- Image upload support (URL-based)
- Author metadata management
- Success/error state handling
- Automatic redirect after submission

**Form Fields:**
- `title` - Article title (required)
- `excerpt` - Short description (required)
- `heroImageUrl` - Hero image URL or path (required)
- `imageCredit` - Image attribution (optional)
- `authorName` - Author's name (required, default: "TDD Sports Staff")
- `authorBio` - Author biography (optional)
- `authorTwitter` - Twitter handle (optional)
- `readTime` - Estimated read time in minutes (required, default: 5)
- `topic` - Article category (required, dropdown)
- `body` - Rich text content (required, TipTap JSON)
- `videoUrl` - Optional video URL (optional)
- `featured` - Pin as featured article (boolean)

**Form Submission Flow:**
```typescript
// CREATE mode
POST /api/articles/submit
→ Generates slug from title
→ Validates all required fields
→ Inserts into database
→ Redirects to /news/{slug}

// EDIT mode
PATCH /api/articles/{slug}
→ Validates all required fields
→ Updates existing article
→ Revalidates cache
→ Redirects to /news/{slug}
```

---

### 2. RichTextEditor Component
**Location:** `/components/admin/RichTextEditor.tsx`

A fully-featured WYSIWYG editor built with TipTap.

**Props:**
```typescript
interface RichTextEditorProps {
  value: JSONContent | null
  onChange: (content: JSONContent) => void
}
```

**Supported Features:**
- **Text Formatting:** Bold, Italic, Underline
- **Headings:** H2, H3, H4
- **Lists:** Bullet lists, Numbered lists
- **Blockquotes**
- **Links:** With auto-linking
- **Images/GIFs:** Via URL
- **Video Embeds:** YouTube, Vimeo, Streamable
- **Undo/Redo**

**Editor Configuration:**
```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
    }),
    Underline,
    Image.configure({ 
      inline: false, 
      HTMLAttributes: { class: 'rounded-lg' } 
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        class: 'text-red-400 underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Placeholder.configure({ 
      placeholder: 'Tell the story...' 
    }),
    TextAlign.configure({ 
      types: ['heading', 'paragraph'] 
    }),
    VideoEmbed,  // Custom extension
  ],
  // ... other config
})
```

**Toolbar Buttons:**
- Text formatting (Bold, Italic, Underline)
- Headings (H2, H3)
- Lists (Bullets, Numbers)
- Quote
- Link (prompts for URL)
- Image/GIF (prompts for URL)
- Video (prompts for URL, auto-detects provider)
- Undo/Redo

---

### 3. Custom Video Extension
**Location:** `/lib/tiptap/video-extension.ts`

Custom TipTap node for embedding videos from multiple providers.

**Supported Providers:**
- **YouTube:** Standard and shortened URLs (youtube.com, youtu.be)
- **Vimeo:** vimeo.com
- **Streamable:** streamable.com

**URL Parsing:**
```typescript
// YouTube examples:
// https://www.youtube.com/watch?v=VIDEO_ID
// https://youtu.be/VIDEO_ID
// → https://www.youtube.com/embed/VIDEO_ID

// Vimeo examples:
// https://vimeo.com/VIDEO_ID
// → https://player.vimeo.com/video/VIDEO_ID

// Streamable examples:
// https://streamable.com/VIDEO_ID
// → https://streamable.com/e/VIDEO_ID
```

**Implementation:**
```typescript
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  
  addAttributes() {
    return {
      src: { default: null },
      provider: { default: null },
      title: { default: null },
    }
  },
  
  // Renders responsive 16:9 iframe
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-video-embed': provider, class: 'tiptap-video-wrapper' },
      ['div', { class: 'relative w-full pt-[56.25%]' },
        ['iframe', {
          src,
          class: 'absolute inset-0 h-full w-full rounded-lg border-0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
          loading: 'lazy',
        }]
      ]
    ]
  }
})
```

---

## API Routes

### 1. POST /api/articles/submit
**Location:** `/app/api/articles/submit/route.ts`

Creates a new article.

**Request Body:**
```typescript
interface SubmitArticlePayload {
  title: string
  excerpt: string
  heroImageUrl: string
  imageCredit?: string
  authorName: string
  authorBio?: string
  authorTwitter?: string
  readTime: number
  topic: string
  body: ArticleBody           // TipTap JSON
  videoUrl?: string
  slug?: string               // Optional override
}
```

**Validation:**
- All required fields must be present
- `readTime` must be > 0
- `body` must be valid TipTap JSON or ArticleBodyBlock[]
- Slug uniqueness check

**Response:**
```typescript
// Success
{ ok: true, slug: "generated-slug" }

// Error
{ error: "Error message" }  // 400, 409, or 500
```

**Flow:**
1. Validate payload
2. Generate slug (or use provided)
3. Check if slug already exists (409 if duplicate)
4. Insert article with `published: true`
5. Revalidate Next.js cache for `/news`, `/news/{slug}`, and `/`
6. Return success with slug

---

### 2. PATCH /api/articles/[slug]
**Location:** `/app/api/articles/[slug]/route.ts`

Updates an existing article.

**Request Body:**
```typescript
interface UpdateArticlePayload {
  title: string
  excerpt: string
  heroImageUrl: string
  imageCredit?: string
  authorName: string
  authorBio?: string
  authorTwitter?: string
  readTime: number
  topic: string
  body: ArticleBody
  videoUrl?: string
  featured?: boolean
}
```

**Response:**
```typescript
// Success
{ success: true }

// Error
{ error: "Error message" }  // 400, 404, or 500
```

**Flow:**
1. Validate payload
2. Check if article exists (404 if not found)
3. Update article (does NOT change slug, published_at, or created_at)
4. Revalidate cache
5. Return success

---

### 3. DELETE /api/articles/[slug]
**Location:** `/app/api/articles/[slug]/route.ts`

Deletes an article.

**Response:**
```typescript
// Success
{ success: true }

// Error
{ error: "Error message" }  // 404 or 500
```

---

## Rich Text Editor

### TipTap JSON Structure

Articles are stored as TipTap JSON (ProseMirror document format):

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [
        { "type": "text", "text": "Introduction" }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        { 
          "type": "text", 
          "text": "This is ",
          "marks": []
        },
        { 
          "type": "text", 
          "text": "bold text",
          "marks": [{ "type": "bold" }]
        }
      ]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://example.com/image.jpg",
        "alt": ""
      }
    },
    {
      "type": "videoEmbed",
      "attrs": {
        "src": "https://www.youtube.com/embed/VIDEO_ID",
        "provider": "youtube",
        "title": "YouTube video"
      }
    }
  ]
}
```

### Legacy Format Support

The system also supports a legacy block format:

```typescript
type ArticleBodyBlock = 
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: number }

type ArticleBody = ArticleBodyBlock[] | TipTapDocNode
```

**Conversion utility:**
```typescript
// lib/articles/body.ts
export function blocksToTipTapDoc(blocks: ArticleBodyBlock[]): TipTapDocNode {
  return {
    type: 'doc',
    content: blocks.map((block) => {
      if (block.type === 'heading') {
        return {
          type: 'heading',
          attrs: { level: block.level || 2 },
          content: [{ type: 'text', text: block.text }],
        }
      }
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: block.text }],
      }
    }),
  }
}
```

---

## Implementation Guide

### Step 1: Set Up Database

1. **Create Supabase project**
2. **Run the articles table migration:**

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  image_credit TEXT,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_twitter TEXT,
  read_time INTEGER NOT NULL DEFAULT 5,
  topic TEXT NOT NULL,
  body JSONB NOT NULL,
  video_url TEXT,
  published BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published, published_at DESC);
CREATE INDEX idx_articles_topic ON articles(topic);
CREATE INDEX idx_articles_featured ON articles(featured) WHERE featured = TRUE;
```

3. **Enable RLS and create policies:**

```sql
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published articles"
ON public.articles FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Allow service role full access to articles"
ON public.articles FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

4. **Create helper function:**

```sql
CREATE OR REPLACE FUNCTION increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;
```

---

### Step 2: Environment Variables

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @tiptap/react @tiptap/starter-kit
npm install @tiptap/extension-image @tiptap/extension-link
npm install @tiptap/extension-underline @tiptap/extension-placeholder
npm install @tiptap/extension-text-align
```

---

### Step 4: Copy Core Files

**Essential files to copy:**

1. **Database Layer:**
   - `/lib/supabase/client.ts` - Client instances
   - `/lib/supabase/articles.ts` - Article queries
   - `/types/supabase.ts` - TypeScript types

2. **Utilities:**
   - `/lib/slug.ts` - Slug generation
   - `/lib/articles/body.ts` - Body validation

3. **Components:**
   - `/components/admin/ArticleForm.tsx` - Main form
   - `/components/admin/RichTextEditor.tsx` - Editor
   - `/lib/tiptap/video-extension.ts` - Video embed

4. **API Routes:**
   - `/app/api/articles/submit/route.ts` - Create
   - `/app/api/articles/[slug]/route.ts` - Update/Delete

5. **Pages:**
   - `/app/admin/submit/page.tsx` - New article
   - `/app/admin/submit/[slug]/page.tsx` - Edit article

---

### Step 5: Customize for Your Use Case

For a **case study** system, you might want to:

1. **Update the topic dropdown:**
```typescript
// In ArticleForm.tsx
<select value={formData.topic} onChange={...}>
  <option value="Technology">Technology</option>
  <option value="E-commerce">E-commerce</option>
  <option value="SaaS">SaaS</option>
  <option value="Healthcare">Healthcare</option>
  <option value="Finance">Finance</option>
</select>
```

2. **Add case study-specific fields:**
```typescript
// Add to formData state
const [formData, setFormData] = useState({
  // ... existing fields
  clientName: initialData?.client_name || '',
  industry: initialData?.industry || '',
  projectDuration: initialData?.project_duration || '',
  results: initialData?.results || '',
})
```

3. **Update the database schema:**
```sql
ALTER TABLE articles ADD COLUMN client_name TEXT;
ALTER TABLE articles ADD COLUMN industry TEXT;
ALTER TABLE articles ADD COLUMN project_duration TEXT;
ALTER TABLE articles ADD COLUMN results TEXT;
```

4. **Rename the table:**
```sql
ALTER TABLE articles RENAME TO case_studies;
```

---

## Features

### ✅ Article Management
- Create, Read, Update, Delete (CRUD) operations
- Draft and published states
- Featured article pinning
- Automatic slug generation
- View tracking
- Like functionality

### ✅ Rich Text Editing
- WYSIWYG editor with toolbar
- Text formatting (bold, italic, underline)
- Headings (H2, H3, H4)
- Lists (bullet, numbered)
- Blockquotes
- Links with auto-linking
- Images and GIFs
- Video embeds (YouTube, Vimeo, Streamable)

### ✅ SEO & Performance
- SEO-friendly slugs
- Automatic cache revalidation
- Optimized database queries with indexes
- Row-Level Security (RLS)

### ✅ Author Management
- Author name, bio, and Twitter
- Image credits and attribution

### ✅ Categorization
- Topic/category support
- Related articles

### ✅ Analytics
- View counter
- Like counter

---

## Usage Examples

### Creating a New Article

```typescript
// Navigate to: /admin/submit

// 1. Fill in the form
Title: "How We Built a Scalable E-commerce Platform"
Excerpt: "A deep dive into our architecture decisions..."
Hero Image: "https://cdn.example.com/hero.jpg"
Author: "John Doe"
Topic: "Technology"

// 2. Write content in the editor
// - Use toolbar for formatting
// - Click "Image/GIF" to add images
// - Click "Video" to embed YouTube videos

// 3. Click "Submit Article"
// → Redirects to /news/how-we-built-a-scalable-e-commerce-platform
```

---

### Editing an Existing Article

```typescript
// Navigate to: /admin/submit/{slug}

// 1. Form pre-populates with existing data
// 2. Make changes
// 3. Click "Update Article"
// → Cache is revalidated
// → Redirects back to article
```

---

### Fetching Articles Programmatically

```typescript
import { fetchPublishedArticles, fetchArticleBySlug } from '@/lib/supabase/articles'

// Get all published articles
const articles = await fetchPublishedArticles(24)

// Get articles by topic
const lakersArticles = await fetchPublishedArticles(10, 'Lakers')

// Get single article
const article = await fetchArticleBySlug('my-article-slug')

// Get related articles
const related = await fetchRelatedArticles(currentArticle.id, currentArticle.topic, 6)
```

---

### Displaying Article Content

```typescript
// components/ArticleContent.tsx
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { VideoEmbed } from '@/lib/tiptap/video-extension'

export function ArticleContent({ body }) {
  const html = generateHTML(body, [
    StarterKit,
    Image,
    Link,
    VideoEmbed,
  ])
  
  return (
    <div 
      className="prose prose-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

---

## Advanced Customization

### Custom TipTap Extensions

Add more functionality to the editor:

```typescript
// Example: Add code blocks
import CodeBlock from '@tiptap/extension-code-block'

const editor = useEditor({
  extensions: [
    // ... existing extensions
    CodeBlock.configure({
      HTMLAttributes: {
        class: 'bg-neutral-900 p-4 rounded-lg',
      },
    }),
  ],
})
```

### Adding More Video Providers

```typescript
// lib/tiptap/video-extension.ts

function parseTwitch(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '')
  if (host !== 'twitch.tv') return null
  
  const videoId = url.pathname.split('/').filter(Boolean)[1]
  if (!videoId) return null
  
  return {
    src: `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`,
    provider: 'twitch',
    title: 'Twitch video',
  }
}

// Add to getVideoAttributes:
function getVideoAttributes(src: string): VideoAttributes | null {
  // ... existing code
  return parseYouTube(url) || parseVimeo(url) || parseStreamable(url) || parseTwitch(url)
}
```

### Image Upload to Supabase Storage

Instead of URLs, upload images:

```typescript
// Add to RichTextEditor.tsx
const handleImageUpload = async (file: File) => {
  const supabase = createSupabaseServiceClient()
  
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('article-images')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

---

## TypeScript Types Reference

```typescript
// Article types
export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  hero_image_url: string
  image_credit: string | null
  author_name: string
  author_bio: string | null
  author_twitter: string | null
  read_time: number
  topic: string
  body: ArticleBody
  video_url: string | null
  published: boolean
  featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  views: number
  likes: number
}

// Body types
export type ArticleBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: number }

export interface TipTapDocNode {
  type: 'doc'
  content?: TipTapNode[]
}

export type ArticleBody = ArticleBodyBlock[] | TipTapDocNode

// Insert/Update types
export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views' | 'likes'>
export type ArticleUpdate = Partial<Omit<Article, 'id' | 'slug' | 'created_at' | 'published_at'>>
```

---

## Best Practices

### Security
- ✅ Use service role client ONLY in API routes (server-side)
- ✅ Use anon client for public reads (client-side)
- ✅ Enable RLS on all tables
- ✅ Validate all user inputs
- ✅ Sanitize HTML output (TipTap handles this)

### Performance
- ✅ Add database indexes on frequently queried columns
- ✅ Use Next.js cache revalidation (`revalidatePath`)
- ✅ Lazy load images and videos
- ✅ Limit query results with pagination

### SEO
- ✅ Generate semantic slugs
- ✅ Use descriptive excerpts
- ✅ Add proper meta tags on article pages
- ✅ Include image alt text

### User Experience
- ✅ Show loading states during submission
- ✅ Display clear error messages
- ✅ Auto-save drafts (consider implementing)
- ✅ Preview before publishing (consider implementing)

---

## Troubleshooting

### Issue: "Article body is required" error
**Solution:** Ensure the editor has content. The validation checks for non-empty text nodes or media nodes.

### Issue: Video embeds not showing
**Solution:** Verify the URL is from a supported provider (YouTube, Vimeo, Streamable) and is publicly accessible.

### Issue: Slug conflicts
**Solution:** The system checks for duplicates and returns a 409 error. Use unique titles or manually override the slug.

### Issue: Images not loading
**Solution:** Ensure URLs are publicly accessible. Consider implementing image upload to Supabase Storage.

### Issue: RLS blocking operations
**Solution:** Use service role client in API routes for inserts/updates. Anon client is only for reads.

---

## License & Credits

This system was built for the LNLS Platform and can be adapted for any content-driven application.

**Key Technologies:**
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [TipTap](https://tiptap.dev/) - Headless editor framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS

---

## Next Steps

Potential enhancements:
- [ ] Draft/preview mode
- [ ] Auto-save functionality
- [ ] Image upload to Supabase Storage
- [ ] Multi-author support
- [ ] Comments system
- [ ] Content scheduling
- [ ] Revision history
- [ ] SEO metadata fields
- [ ] Social media previews
- [ ] Email notifications
- [ ] Analytics dashboard

---

**Ready to implement?** Start with the [Implementation Guide](#implementation-guide) section above!
