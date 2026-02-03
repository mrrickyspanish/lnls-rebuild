import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// AI Assistant Actions
type AIAction = 
  | 'summarize'
  | 'generate-social'
  | 'generate-seo'
  | 'suggest-related'
  | 'create-thread'
  | 'generate-show-notes'
  | 'extract-quotes'
  | 'format-article';

interface AIAssistRequest {
  action: AIAction;
  content: string;
  context?: {
    title?: string;
    author?: string;
    category?: string;
    platform?: 'twitter' | 'instagram' | 'linkedin' | 'threads';
  };
}

interface AIAssistResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<AIAssistResponse>> {
  try {
    const body: AIAssistRequest = await req.json();
    const { action, content, context } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    let result: any;

    switch (action) {
      case 'summarize':
        result = await summarizeContent(content, context);
        break;
      
      case 'generate-social':
        result = await generateSocialCaptions(content, context);
        break;
      
      case 'generate-seo':
        result = await generateSEO(content, context);
        break;
      
      case 'suggest-related':
        result = await suggestRelatedTopics(content, context);
        break;
      
      case 'create-thread':
        result = await createTwitterThread(content, context);
        break;
      
      case 'generate-show-notes':
        result = await generateShowNotes(content, context);
        break;
      
      case 'extract-quotes':
        result = await extractQuotes(content, context);
        break;
      
      case 'format-article':
        result = await formatArticle(content, context);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI Assist Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Summarize article content for newsletters or previews
async function summarizeContent(content: string, context?: any): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Summarize this Lakers/NBA article in 2-3 concise sentences. Keep the tone conversational and engaging, like you're explaining it to a basketball fan at a bar.

Title: ${context?.title || 'Untitled'}
Category: ${context?.category || 'NBA News'}

Article:
${content}

Summary:`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  return textContent?.type === 'text' ? textContent.text.trim() : '';
}

// Generate social media captions for multiple platforms
async function generateSocialCaptions(content: string, context?: any): Promise<Record<string, string>> {
  const platform = context?.platform || 'all';
  
  const prompt = platform === 'all' 
    ? `Create social media captions for this Lakers/NBA article across multiple platforms. Match the tone and format for each platform:

Title: ${context?.title || 'Untitled'}

Article excerpt:
${content.substring(0, 800)}

Generate captions for:
1. Twitter/X (280 chars max, punchy, uses hoops slang, 2-3 relevant hashtags)
2. Instagram (engaging first line, storytelling, 5-7 hashtags, emojis welcome)
3. LinkedIn (professional but conversational, thought-leadership angle, 2-3 hashtags)
4. Threads (casual, conversational, like a good thread reply)

Format as JSON:
{
  "twitter": "...",
  "instagram": "...",
  "linkedin": "...",
  "threads": "..."
}`
    : `Create a ${platform} caption for this Lakers/NBA article:

Title: ${context?.title || 'Untitled'}

Article excerpt:
${content.substring(0, 800)}

Caption:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return { error: 'Failed to generate captions' };
  }

  if (platform === 'all') {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: textContent.text };
    } catch {
      return { raw: textContent.text };
    }
  }

  return { [platform]: textContent.text.trim() };
}

// Generate SEO metadata
async function generateSEO(content: string, context?: any): Promise<{
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Generate SEO metadata for this Lakers/NBA article:

Title: ${context?.title || 'Untitled'}
Category: ${context?.category || 'NBA News'}

Article excerpt:
${content.substring(0, 1000)}

Provide:
1. Meta title (50-60 chars, includes key player/team names)
2. Meta description (150-160 chars, compelling hook)
3. 5-7 relevant keywords (mix of broad and specific)

Format as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["keyword1", "keyword2", ...]
}`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return {
      metaTitle: context?.title || 'LNLS Article',
      metaDescription: '',
      keywords: []
    };
  }

  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      metaTitle: context?.title || 'LNLS Article',
      metaDescription: '',
      keywords: []
    };
  } catch {
    return {
      metaTitle: context?.title || 'LNLS Article',
      metaDescription: '',
      keywords: []
    };
  }
}

// Suggest related topics or articles
async function suggestRelatedTopics(content: string, context?: any): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Based on this Lakers/NBA article, suggest 5 related topics or article ideas that LNLS should cover next. Think about: player storylines, trade implications, tactical analysis, or cultural angles.

Title: ${context?.title || 'Untitled'}

Article excerpt:
${content.substring(0, 800)}

List 5 specific, actionable article ideas (one per line):`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return [];
  }

  return textContent.text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .slice(0, 5);
}

// Create Twitter thread from article
async function createTwitterThread(content: string, context?: any): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `Convert this Lakers/NBA article into a Twitter thread (5-7 tweets, 280 chars each). Make it engaging, punchy, and use NBA Twitter language.

Title: ${context?.title || 'Untitled'}

Article:
${content}

Thread (one tweet per line, numbered):`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return [];
  }

  return textContent.text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}
// Format raw article text into structured TipTap JSON
async function formatArticle(content: string, context?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: `You are a professional sports editor formatting an article for The Daily Dribble, a Lakers/NBA publication.

Transform this raw text into a properly structured TipTap JSON document with excellent visual formatting:

FORMATTING GUIDELINES:
- Use H2 headings for major sections (player analysis, game recap sections, etc.)
- Use H3 for subsections if needed
- Bold player names, key stats, and important phrases
- Use calloutCard nodes for standout quotes, key takeaways, or critical stats
- Create proper paragraph breaks for readability
- Use bullet lists for stats, lineups, or key points
- Ensure good flow and visual hierarchy

RAW TEXT:
${content}

Return ONLY valid TipTap JSON in this exact structure (no markdown, no explanations):
{
  "type": "doc",
  "content": [
    {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Heading text"}]},
    {"type": "paragraph", "content": [{"type": "text", "text": "Regular text"}, {"type": "text", "marks": [{"type": "bold"}], "text": "bold text"}]},
    {"type": "calloutCard", "content": [{"type": "text", "text": "Important callout"}]},
    {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "List item"}]}]}]}
  ]
}

IMPORTANT: Return only the JSON object, no other text.`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in AI response');
  }

  try {
    // Clean up the response and parse JSON
    let jsonText = textContent.text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    
    const formatted = JSON.parse(jsonText);
    return formatted;
  } catch (error) {
    console.error('Failed to parse AI-formatted article:', error);
    throw new Error('AI returned invalid JSON format');
  }
}
// Generate podcast show notes from transcript
async function generateShowNotes(transcript: string, context?: any): Promise<{
  summary: string;
  topics: Array<{ timestamp: string; topic: string }>;
  keyQuotes: string[];
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Generate detailed show notes for this LNLS podcast episode:

Episode: ${context?.title || 'Untitled Episode'}

Transcript:
${transcript.substring(0, 4000)}

Provide:
1. Episode summary (2-3 sentences)
2. Topic breakdown with timestamps (format: "MM:SS - Topic")
3. 3-5 memorable quotes

Format as JSON:
{
  "summary": "...",
  "topics": [
    { "timestamp": "00:00", "topic": "..." },
    ...
  ],
  "keyQuotes": ["...", "...", ...]
}`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return {
      summary: '',
      topics: [],
      keyQuotes: []
    };
  }

  try {
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: '',
      topics: [],
      keyQuotes: []
    };
  } catch {
    return {
      summary: '',
      topics: [],
      keyQuotes: []
    };
  }
}

// Extract notable quotes from article
async function extractQuotes(content: string, context?: any): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Extract 3-5 of the most shareable, quotable lines from this Lakers/NBA article. Look for hot takes, strong opinions, or memorable phrases.

Title: ${context?.title || 'Untitled'}

Article:
${content}

Quotes (one per line):`
    }]
  });

  const textContent = message.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    return [];
  }

  return textContent.text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^["']|["']$/g, '').trim())
    .slice(0, 5);
}
