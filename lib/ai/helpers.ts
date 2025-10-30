import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface SocialCaptions {
  twitter: string
  instagram: string
  linkedin: string
}

export async function generateSocialCaptions(
  articleTitle: string,
  articleExcerpt: string
): Promise<SocialCaptions> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate social media captions for this article:

Title: ${articleTitle}
Excerpt: ${articleExcerpt}

Create three versions:
1. X/Twitter thread (3-4 tweets, engaging, uses basketball slang)
2. Instagram caption (concise, emoji-friendly, call-to-action)
3. LinkedIn post (professional but conversational)

Format as JSON:
{
  "twitter": "...",
  "instagram": "...",
  "linkedin": "..."
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  throw new Error('Failed to generate social captions')
}

export async function generateArticleSummary(articleBody: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Summarize this article in 2-3 sentences for a newsletter:

${articleBody}

Keep it conversational and engaging. Focus on the key takeaway.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }

  throw new Error('Failed to generate summary')
}

export async function generateSEOMetadata(
  articleTitle: string,
  articleExcerpt: string
): Promise<{ metaTitle: string; metaDescription: string }> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Generate SEO metadata for this article:

Title: ${articleTitle}
Excerpt: ${articleExcerpt}

Format as JSON:
{
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "SEO-optimized description (150-160 chars)"
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  throw new Error('Failed to generate SEO metadata')
}

export async function generateShowNotes(transcript: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Generate show notes from this podcast transcript:

${transcript.slice(0, 8000)}

Include:
- Brief episode overview (2-3 sentences)
- Key topics discussed (bullet points)
- Notable quotes (2-3)
- Main takeaways

Format in markdown.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }

  throw new Error('Failed to generate show notes')
}

export async function summarizeNewsArticle(
  title: string,
  content: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Summarize this Lakers/NBA news article in 2-3 sentences. Keep the tone conversational and engaging:

Title: ${title}
Content: ${content.slice(0, 2000)}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return content.text
  }

  throw new Error('Failed to summarize news')
}
