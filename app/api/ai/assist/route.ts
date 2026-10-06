import { requireAdmin } from '@/lib/auth/guard'
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { cleanStats } from '@/lib/tiptap/stat-block-extension';
import { DEFAULT_TAKEAWAYS_TITLE } from '@/lib/tiptap/key-takeaways-extension';

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

type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null;
}

function toText(value: unknown): string | null {
  // Preserve whitespace-only strings (e.g. " " between bold words).
  // Only reject truly empty strings.
  if (typeof value !== 'string') return null;
  if (value === '') return null;
  return value;
}

function makeFallbackDoc(rawText: string): AnyRecord {
  const text = rawText.trim() || 'Formatting completed, but no structured content was returned.';
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
}

// Marks the editor and article page know. An unknown mark type in the
// returned JSON would make the editor refuse the whole document.
const ALLOWED_MARKS = new Set(['bold', 'italic', 'underline']);

/** Lowercased with spaces and thousands separators removed, for loose matching. */
function squash(text: string): string {
  return text.toLowerCase().replace(/[\s,]/g, '');
}

/**
 * True when every number in `text` appears in the writer's raw text. The
 * formatter may restructure and summarize, but a sports site can't publish a
 * stat the model made up, so blocks built around numbers (stats, tables,
 * takeaways) only keep numbers that are in the source.
 */
function numbersAreSourced(text: string, source: string): boolean {
  const numbers = text.match(/\d[\d.,]*/g) ?? [];
  const haystack = squash(source);
  return numbers.every((n) => haystack.includes(squash(n).replace(/[.,]+$/, '')));
}

/** True when `text` appears in the source, ignoring case, spacing and punctuation. */
function appearsInSource(text: string, source: string): boolean {
  const plain = (value: string) => squash(value.replace(/[“”"‘’'.,!?;:()\u2014\u2013-]/g, ''));
  const needle = plain(text);
  return needle.length > 0 && plain(source).includes(needle);
}

/** All text inside a sanitized node tree, joined. */
function allText(node: unknown): string {
  if (Array.isArray(node)) return node.map(allText).join(' ');
  if (!isRecord(node)) return '';
  return (typeof node.text === 'string' ? node.text : '') + ' ' + allText(node.content ?? []);
}

function inlineText(content: unknown[]): string {
  return content.map((node) => (isRecord(node) && typeof node.text === 'string' ? node.text : '')).join('');
}

function sanitizeInline(node: AnyRecord): AnyRecord[] {
  return Array.isArray(node.content)
    ? (node.content.map(sanitizeInlineNode).filter(Boolean) as AnyRecord[])
    : [];
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  const withoutFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  if (withoutFences.startsWith('{') && withoutFences.endsWith('}')) {
    return withoutFences;
  }

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return withoutFences.slice(start, end + 1);
  }

  return withoutFences;
}

function sanitizeInlineNode(node: unknown): AnyRecord | null {
  if (!isRecord(node) || typeof node.type !== 'string') return null;

  if (node.type === 'text') {
    const text = toText(node.text);
    if (!text) return null;

    const marks = Array.isArray(node.marks)
      ? node.marks
          .filter((mark) => isRecord(mark) && typeof mark.type === 'string' && ALLOWED_MARKS.has(mark.type))
          .map((mark) => ({ type: (mark as AnyRecord).type }))
      : undefined;

    return marks && marks.length > 0
      ? { type: 'text', text, marks }
      : { type: 'text', text };
  }

  if (node.type === 'hardBreak') {
    return { type: 'hardBreak' };
  }

  return null;
}

function sanitizeBlockNode(node: unknown, source: string): AnyRecord | null {
  if (!isRecord(node) || typeof node.type !== 'string') return null;

  if (node.type === 'paragraph' || node.type === 'calloutCard') {
    const inline = sanitizeInline(node);
    if (inline.length === 0) return null;
    return { type: node.type, content: inline };
  }

  // A pull quote repeats a line from the story, so it has to be one. If the
  // model wrote its own line, keep the words as an ordinary paragraph.
  if (node.type === 'pullQuote') {
    const inline = sanitizeInline(node);
    if (inline.length === 0) return null;
    return appearsInSource(inlineText(inline), source)
      ? { type: 'pullQuote', content: inline }
      : { type: 'paragraph', content: inline };
  }

  if (node.type === 'blockquote') {
    const paragraphs = Array.isArray(node.content)
      ? node.content
          .map((child) => sanitizeBlockNode(child, source))
          .filter((child): child is AnyRecord => isRecord(child) && child.type === 'paragraph')
      : [];
    if (paragraphs.length === 0) return null;
    return { type: 'blockquote', content: paragraphs };
  }

  if (node.type === 'heading') {
    const inline = sanitizeInline(node);
    if (inline.length === 0) return null;
    const level = isRecord(node.attrs) && typeof node.attrs.level === 'number'
      ? node.attrs.level
      : 2;
    const normalizedLevel = Math.max(2, Math.min(3, level));
    return { type: 'heading', attrs: { level: normalizedLevel }, content: inline };
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    const items = Array.isArray(node.content)
      ? node.content
          .map((item) => sanitizeBlockNode(item, source))
          .filter((item): item is AnyRecord => isRecord(item) && item.type === 'listItem')
      : [];

    if (items.length === 0) return null;
    return { type: node.type, content: items };
  }

  if (node.type === 'listItem') {
    const children = Array.isArray(node.content)
      ? node.content
          .map((child) => sanitizeBlockNode(child, source))
          .filter(Boolean)
      : [];

    if (children.length === 0) return null;
    return { type: 'listItem', content: children };
  }

  if (node.type === 'keyTakeaways') {
    const list = Array.isArray(node.content)
      ? node.content.find((child) => isRecord(child) && child.type === 'bulletList')
      : null;
    const sanitized = list ? sanitizeBlockNode(list, source) : null;
    const items = Array.isArray(sanitized?.content)
      ? (sanitized.content as AnyRecord[]).filter((item) =>
          numbersAreSourced(allText(item), source)
        )
      : [];
    if (items.length === 0) return null;
    const rawTitle = isRecord(node.attrs) && typeof node.attrs.title === 'string' ? node.attrs.title.trim() : '';
    return {
      type: 'keyTakeaways',
      attrs: { title: rawTitle && rawTitle.length <= 40 ? rawTitle : DEFAULT_TAKEAWAYS_TITLE },
      content: [{ type: 'bulletList', content: items }],
    };
  }

  if (node.type === 'statBlock') {
    const attrs = isRecord(node.attrs) ? node.attrs : {};
    const stats = cleanStats(attrs.stats).filter((stat) =>
      numbersAreSourced(`${stat.value} ${stat.label}`, source)
    );
    if (stats.length === 0) return null;
    const statSource = typeof attrs.source === 'string' ? attrs.source.trim().slice(0, 80) : '';
    return { type: 'statBlock', attrs: { stats, source: statSource } };
  }

  if (node.type === 'table') {
    const rows = Array.isArray(node.content)
      ? node.content.filter((row): row is AnyRecord => isRecord(row) && row.type === 'tableRow').slice(0, 30)
      : [];
    const firstRow = rows[0];
    const width = Math.min(Array.isArray(firstRow?.content) ? firstRow.content.length : 0, 8);
    if (rows.length < 2 || width < 2) return null;

    let sourced = true;
    const cleanRows = rows.map((row, rowIndex) => {
      const cells = Array.isArray(row.content) ? row.content.slice(0, width) : [];
      while (cells.length < width) cells.push({});
      return {
        type: 'tableRow',
        content: cells.map((cell) => {
          const paragraphs = isRecord(cell) && Array.isArray(cell.content)
            ? cell.content
                .map((child) => sanitizeBlockNode(child, source))
                .filter((child): child is AnyRecord => isRecord(child) && child.type === 'paragraph')
            : [];
          if (!numbersAreSourced(allText(paragraphs), source)) sourced = false;
          return {
            type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
            content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph' }],
          };
        }),
      };
    });
    // A table with a number that isn't in the writer's text is dropped whole:
    // one invented figure makes the rest untrustworthy.
    return sourced ? { type: 'table', content: cleanRows } : null;
  }

  return null;
}

function sanitizeTipTapDoc(value: unknown, rawText: string): AnyRecord {
  if (!isRecord(value) || value.type !== 'doc') {
    return makeFallbackDoc(rawText);
  }

  const content = Array.isArray(value.content)
    ? value.content.map((node) => sanitizeBlockNode(node, rawText)).filter(Boolean)
    : [];

  if (content.length === 0) {
    return makeFallbackDoc(rawText);
  }

  return {
    type: 'doc',
    content,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<AIAssistResponse>> {
  const denied = await requireAdmin();
  if (denied) return denied as NextResponse<AIAssistResponse>;

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
    model: 'claude-sonnet-4-20250514',
    // The output is the whole article as JSON, several times longer than
    // the prose. At 4096 a long piece could be cut off mid-document, and a
    // truncated document fails to parse and falls back to one unformatted
    // paragraph.
    max_tokens: 16000,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: `You are a professional sports editor formatting an article for The Daily Dribble, a Lakers/NBA publication.

Transform this raw text into a properly structured TipTap JSON document with excellent visual formatting. Keep the writer's words: restructure and format, don't rewrite.

FORMATTING GUIDELINES:
- Use H2 headings for major sections (player analysis, game recap sections, etc.)
- Use H3 for subsections if needed
- Bold player names, key stats, and important phrases
- Create proper paragraph breaks for readability
- Use bullet lists for lineups or lists of points
- Use a blockquote for a quoted passage (a player's or coach's words that run a sentence or more)
- Use at most one pullQuote: a single striking line copied word-for-word from the text, placed a few paragraphs after where it appears
- Use calloutCard for one important aside or note
- Use keyTakeaways (2-4 short bullets) near the top only for longer pieces with several distinct points
- Use statBlock for 1-3 standout numbers, and a table for comparisons across players or games

NUMBERS - STRICT:
- Every number in a statBlock, table, or keyTakeaways bullet must appear in the raw text exactly. Never calculate, round, convert, or invent a number. If the text has no standout numbers, use no statBlock or table.

RAW TEXT:
${content}

Return ONLY valid TipTap JSON in this exact structure (no markdown, no explanations):
{
  "type": "doc",
  "content": [
    {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Heading text"}]},
    {"type": "paragraph", "content": [{"type": "text", "text": "Regular text"}, {"type": "text", "marks": [{"type": "bold"}], "text": "bold text"}]},
    {"type": "blockquote", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "A quoted passage."}]}]},
    {"type": "pullQuote", "content": [{"type": "text", "text": "One line copied from the text"}]},
    {"type": "calloutCard", "content": [{"type": "text", "text": "Important callout"}]},
    {"type": "keyTakeaways", "attrs": {"title": "The short version"}, "content": [{"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "A key point"}]}]}]}]},
    {"type": "statBlock", "attrs": {"stats": [{"value": "31.4", "label": "Points per game"}], "source": "NBA.com"}},
    {"type": "table", "content": [
      {"type": "tableRow", "content": [{"type": "tableHeader", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Player"}]}]}, {"type": "tableHeader", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "PPG"}]}]}]},
      {"type": "tableRow", "content": [{"type": "tableCell", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Name"}]}]}, {"type": "tableCell", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "24.8"}]}]}]}
    ]},
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
    const jsonText = extractJsonObject(textContent.text);
    const formatted = JSON.parse(jsonText);
    return sanitizeTipTapDoc(formatted, content);
  } catch (error) {
    console.error('Failed to parse AI-formatted article:', error);
    return makeFallbackDoc(content);
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
