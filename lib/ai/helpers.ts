import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateSocialCaptions(article: {
  title: string;
  excerpt: string;
  url: string;
}): Promise<{ instagram: string; twitter: string; facebook: string }> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Generate social media captions for this article:

Title: ${article.title}
Excerpt: ${article.excerpt}

Generate captions for Instagram, Twitter/X, and Facebook. Format as JSON:
{
  "instagram": "caption here",
  "twitter": "caption here",
  "facebook": "caption here"
}`,
      },
    ],
  });

  const responseContent = message.content[0]
  if (responseContent.type === 'text') {
    const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  return { instagram: '', twitter: '', facebook: '' }
}

export async function generateNewsletterSummary(article: {
  title: string;
  excerpt: string;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Summarize this article in 2-3 sentences for a newsletter:

Title: ${article.title}
Excerpt: ${article.excerpt}`,
      },
    ],
  });

  const responseContent = message.content[0]
  if (responseContent.type === 'text') {
    return responseContent.text
  }

  return ''
}

export async function generateSEOMetadata(article: {
  title: string;
  body: string;
}): Promise<{ metaTitle: string; metaDescription: string; keywords: string[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Generate SEO metadata for this article:

Title: ${article.title}
Body: ${article.body.slice(0, 1000)}

Format as JSON:
{
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "SEO description (140-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`,
      },
    ],
  });

  const responseContent = message.content[0]
  if (responseContent.type === 'text') {
    const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }

  return { metaTitle: article.title, metaDescription: '', keywords: [] }
}

export async function generateShowNotes(transcript: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Generate show notes from this podcast transcript:

${transcript.slice(0, 4000)}

Include key topics, timestamps (if identifiable), and main takeaways.`,
      },
    ],
  });

  const responseContent = message.content[0]
  if (responseContent.type === 'text') {
    return responseContent.text
  }

  return ''
}

export async function summarizeNewsArticle(
  title: string,
  articleContent: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Summarize this Lakers/NBA news article in 2-3 sentences. Keep the tone conversational and engaging:

Title: ${title}
Content: ${articleContent.slice(0, 2000)}`,
      },
    ],
  });

  const responseContent = message.content[0]
  if (responseContent.type === 'text') {
    return responseContent.text
  }

  return ''
}
