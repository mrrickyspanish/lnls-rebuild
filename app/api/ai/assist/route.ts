import { requireAdmin } from '@/lib/auth/guard'
import { NextRequest, NextResponse } from 'next/server';
import { askClaude } from '@/lib/ai/claude';
import { disallowedBlockReason, plainDocFrom, verifyFormattedDoc } from '@/lib/ai/format-verify';

// Formatting a long article (the whole piece written back out as JSON, with
// thinking) can run past Vercel's default function time limit.
export const maxDuration = 300;


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
    articleType?: string;
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

/** The writer's text untouched, one paragraph per line. */
function makeFallbackDoc(rawText: string): AnyRecord {
  return plainDocFrom(rawText) as AnyRecord;
}

// The formatter may emphasize the writer's words with bold and italic only.
// Anything else is dropped (an unknown mark would also make the editor
// refuse the whole document).
const ALLOWED_MARKS = new Set(['bold', 'italic']);

// Block types the formatter may return. Anything else (takeaways boxes,
// stat blocks, callouts, images) adds copy or labels the writer didn't
// write, so a result containing one is rejected (lib/ai/format-verify.ts).
const FORMATTER_BLOCKS = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'pullQuote', 'table']);

/** Lowercased with spaces and thousands separators removed, for loose matching. */
function squash(text: string): string {
  return text.toLowerCase().replace(/[\s,]/g, '');
}

/**
 * True when every number in `text` appears in the writer's raw text. Used
 * for the headline/summary suggestions: a suggestion with a number that
 * isn't in the draft is dropped.
 */
function numbersAreSourced(text: string, source: string): boolean {
  const numbers = text.match(/\d[\d.,]*/g) ?? [];
  const haystack = squash(source);
  return numbers.every((n) => haystack.includes(squash(n).replace(/[.,]+$/, '')));
}

/** All text inside a sanitized node tree, joined. */
function allText(node: unknown): string {
  if (Array.isArray(node)) return node.map(allText).join(' ');
  if (!isRecord(node)) return '';
  return (typeof node.text === 'string' ? node.text : '') + ' ' + allText(node.content ?? []);
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

  if (node.type === 'paragraph') {
    const inline = sanitizeInline(node);
    if (inline.length === 0) return null;
    return { type: node.type, content: inline };
  }

  // A pull quote repeats a line from the story; sanitizeTipTapDoc checks
  // that it does once the whole document is known.
  if (node.type === 'pullQuote') {
    const inline = sanitizeInline(node);
    if (inline.length === 0) return null;
    return { type: 'pullQuote', content: inline };
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

  if (node.type === 'table') {
    const rows = Array.isArray(node.content)
      ? node.content.filter((row): row is AnyRecord => isRecord(row) && row.type === 'tableRow').slice(0, 30)
      : [];
    const firstRow = rows[0];
    const width = Math.min(Array.isArray(firstRow?.content) ? firstRow.content.length : 0, 8);
    if (rows.length < 2 || width < 2) return null;

    // Header cells stay headers and data cells stay data: the verbatim check
    // only accepts generic headers ("Stat", "Value"), so a data row must never
    // be turned into a header row here.
    const cleanRows = rows.map((row) => {
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
          return {
            type: isRecord(cell) && cell.type === 'tableHeader' ? 'tableHeader' : 'tableCell',
            content: paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph' }],
          };
        }),
      };
    });
    return { type: 'table', content: cleanRows };
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

  // Pull quotes and tables are checked against the writer's sentences by
  // verifyFormattedDoc, which drops any that aren't verbatim copies.
  return {
    type: 'doc',
    content,
  };
}

export type FormatSuggestions = {
  headlines: string[];
  summary: string | null;
  metaDescription: string | null;
  readTime: number;
};

/** Average adult reading speed for this kind of copy. */
const WORDS_PER_MINUTE = 230;

/** Trims to at most `max` characters, ending on a whole word. */
function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max + 1).replace(/\s+\S*$/, '').replace(/[,;:\-–—]$/, '').trim();
}

/**
 * The headline, summary and search-description ideas that come back with a
 * formatted story. Each is only a suggestion: the editor shows them for the
 * writer to accept or not. Any idea with a number that isn't in the writer's
 * text is dropped, the same rule as stats and tables. Read time is counted,
 * not asked of the model.
 */
function sanitizeSuggestions(value: unknown, rawText: string, doc: AnyRecord): FormatSuggestions {
  const record = isRecord(value) ? value : {};
  const sourced = (text: string) => text.length > 0 && numbersAreSourced(text, rawText);

  const headlines = Array.isArray(record.headlines)
    ? record.headlines
        .filter((h): h is string => typeof h === 'string')
        .map((h) => clip(h.replace(/^["'“”]+|["'“”]+$/g, ''), 120))
        .filter(sourced)
        .filter((h, i, all) => all.indexOf(h) === i)
        .slice(0, 3)
    : [];

  const summary = typeof record.summary === 'string' ? clip(record.summary, 300) : '';
  const metaDescription = typeof record.metaDescription === 'string' ? clip(record.metaDescription, 160) : '';

  const words = allText(doc).split(/\s+/).filter(Boolean).length;

  return {
    headlines,
    summary: sourced(summary) ? summary : null,
    metaDescription: sourced(metaDescription) ? metaDescription : null,
    readTime: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
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
  const text = await askClaude(`Summarize this Lakers/NBA article in 2-3 concise sentences. Keep the tone conversational and engaging, like you're explaining it to a basketball fan at a bar.

Title: ${context?.title || 'Untitled'}
Category: ${context?.category || 'NBA News'}

Article:
${content}

Summary:`);
  return text.trim();
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

  const text = await askClaude(prompt);
  if (!text) {
    return { error: 'Failed to generate captions' };
  }

  if (platform === 'all') {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      return { raw: text };
    }
  }

  return { [platform]: text.trim() };
}

// Generate SEO metadata
async function generateSEO(content: string, context?: any): Promise<{
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}> {
  const text = await askClaude(`Generate SEO metadata for this Lakers/NBA article:

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
}`);
  if (!text) {
    return {
      metaTitle: context?.title || 'LNLS Article',
      metaDescription: '',
      keywords: []
    };
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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
  const text = await askClaude(`Based on this Lakers/NBA article, suggest 5 related topics or article ideas that LNLS should cover next. Think about: player storylines, trade implications, tactical analysis, or cultural angles.

Title: ${context?.title || 'Untitled'}

Article excerpt:
${content.substring(0, 800)}

List 5 specific, actionable article ideas (one per line):`);
  if (!text) {
    return [];
  }

  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .slice(0, 5);
}

// Create Twitter thread from article
async function createTwitterThread(content: string, context?: any): Promise<string[]> {
  const text = await askClaude(`Convert this Lakers/NBA article into a Twitter thread (5-7 tweets, 280 chars each). Make it engaging, punchy, and use NBA Twitter language.

Title: ${context?.title || 'Untitled'}

Article:
${content}

Thread (one tweet per line, numbered):`);
  if (!text) {
    return [];
  }

  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}
// Format raw article text into structured TipTap JSON.
//
// A formatter, not an editor: the writer's words are untouchable. The rules
// below are the writer's own, and verifyFormattedDoc enforces them after the
// fact: any word-level difference between the story and the pasted draft
// rejects the AI's version, and the writer gets their text back with
// paragraph breaks only, plus the reason.
export type FormatCheck = {
  /** True when the AI's structure was kept; false when it was rejected. */
  verified: boolean;
  /** What the AI tried to change, in plain words, when rejected. */
  reason: string | null;
  /** Pull quotes and tables dropped for not being verbatim copies. */
  dropped: { pullQuotes: number; tables: number };
};

async function formatArticle(content: string, context?: any): Promise<{ doc: AnyRecord; suggestions: FormatSuggestions; check: FormatCheck }> {
  const currentHeadline = typeof context?.title === 'string' && context.title.trim() ? context.title.trim() : null;
  // The answer is the whole article as JSON, several times longer than the
  // prose, plus the model's thinking. A cut-off document can't be parsed, so
  // the limit is generous; tokens are only billed when used.
  const text = await askClaude(`You are a formatter, not an editor. Your only job is structure. The author's words are untouchable.

You are formatting a draft for The Daily Dribble, Rick Barnes Jr.'s one-writer publication. Turn the draft below into a TipTap JSON document.

NEVER rules:
1. Never delete, rewrite, paraphrase, summarize, or rearrange any word, sentence, or phrase the author wrote. Every sentence in your output must appear verbatim in the input.
2. Never invent copy. No new sentences, transitions, labels, headings, pull quotes, captions, or conclusions that did not exist in the original text.
3. Never "fix" the author's voice. Slang, profanity, fragments, repetition, typos, and stylization (e.g. "06 Mamba numbers") stay exactly as written.
4. Never alter numbers, stats, names, or dates.

ALLOWED rules:
1. Whitespace, line breaks, paragraph breaks.
2. Heading levels and heading formatting, using only words from the article. A heading is one of the author's own lines turned into a heading, in place. It is not also kept as a paragraph.
3. Bold and italic emphasis on existing words. No rewording to earn the emphasis.
4. Bullet or numbered lists, where each item is one of the author's own sentences, copied verbatim. The sentences move into the list in place; they are not also kept as paragraphs.
5. Pull quotes ("pullQuote") that duplicate an existing sentence from the article word for word. A pull quote is a copy of a sentence, not a new one. At most one. The original sentence stays where it is.
6. Stats tables built from a stats sentence already in the article: every cell must contain numbers and words lifted verbatim from that sentence. Column headers must be plain and generic ("Stat", "Value") or omitted. Never invent header labels. The original sentence stays where it is.
7. Blockquotes for a passage the author quoted, in place, word for word.

Use no other block types: no takeaway boxes, stat blocks, callouts, images or captions.

VERIFICATION:
After formatting, the only acceptable differences from the original are formatting markers and structure. Reading your paragraphs, headings, lists and blockquotes in order must give back the author's text word for word, in the same order. Any word-level difference means the output is rejected.

SUGGESTIONS (separate from the article; never put these into it):
- headlines: 3 headline options, under 90 characters each, for the writer to choose from. ${currentHeadline ? `The writer's working headline is: "${currentHeadline}".` : 'The writer has no headline yet.'}
- summary: 1-2 sentences (under 280 characters) shown under the headline.
- metaDescription: under 155 characters, for search results and link previews.
- Every number in a suggestion must appear in the draft exactly.

DRAFT:
${content}

Return ONLY a JSON object in this exact structure (no markdown, no explanations):
{
  "doc": {
    "type": "doc",
    "content": [
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "One of the author's own lines"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "The author's sentence, "}, {"type": "text", "marks": [{"type": "bold"}], "text": "with emphasis"}, {"type": "text", "text": " on existing words."}]},
      {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "One of the author's sentences, verbatim."}]}]}]},
      {"type": "blockquote", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "A passage the author quoted."}]}]},
      {"type": "pullQuote", "content": [{"type": "text", "text": "An exact copy of one of the author's sentences."}]},
      {"type": "table", "content": [
        {"type": "tableRow", "content": [{"type": "tableHeader", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Stat"}]}]}, {"type": "tableHeader", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Value"}]}]}]},
        {"type": "tableRow", "content": [{"type": "tableCell", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "words lifted from the stats sentence"}]}]}, {"type": "tableCell", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "28 of 46"}]}]}]}
      ]}
    ]
  },
  "headlines": ["Option one", "Option two", "Option three"],
  "summary": "One or two sentences.",
  "metaDescription": "Under 155 characters."
}

IMPORTANT: Return only the JSON object, no other text.`, { maxTokens: 64000 });
  if (!text) {
    throw new Error('No text content in AI response');
  }

  const rejected = (reason: string): { doc: AnyRecord; suggestions: FormatSuggestions; check: FormatCheck } => {
    const doc = plainDocFrom(content) as AnyRecord;
    return { doc, suggestions: sanitizeSuggestions(null, content, doc), check: { verified: false, reason, dropped: { pullQuotes: 0, tables: 0 } } };
  };

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonObject(text));
  } catch (error) {
    console.error('Failed to parse AI-formatted article:', error);
    return rejected('the AI sent back something that could not be read');
  }

  // Older-style answers are a bare document with no suggestions.
  const rawDoc = isRecord(parsed) && parsed.type === 'doc' ? parsed : isRecord(parsed) ? parsed.doc : null;
  const disallowed = isRecord(rawDoc) && Array.isArray(rawDoc.content)
    ? rawDoc.content.find((node) => isRecord(node) && typeof node.type === 'string' && !FORMATTER_BLOCKS.has(node.type))
    : null;
  if (isRecord(disallowed)) {
    console.warn('AI formatter used a disallowed block:', disallowed.type);
    const result = rejected(disallowedBlockReason(String(disallowed.type)));
    return { ...result, suggestions: sanitizeSuggestions(parsed, content, result.doc) };
  }

  const check = verifyFormattedDoc(sanitizeTipTapDoc(rawDoc, content) as any, content);
  if (!check.ok) {
    console.warn('AI formatter changed the writer\'s words; rejected:', check.reason);
    const result = rejected(check.reason ?? 'changed the wording');
    return { ...result, suggestions: sanitizeSuggestions(parsed, content, result.doc) };
  }

  const doc = check.doc as AnyRecord;
  return {
    doc,
    suggestions: sanitizeSuggestions(parsed, content, doc),
    check: { verified: true, reason: null, dropped: check.dropped },
  };
}
// Generate podcast show notes from transcript
async function generateShowNotes(transcript: string, context?: any): Promise<{
  summary: string;
  topics: Array<{ timestamp: string; topic: string }>;
  keyQuotes: string[];
}> {
  const text = await askClaude(`Generate detailed show notes for this LNLS podcast episode:

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
}`);
  if (!text) {
    return {
      summary: '',
      topics: [],
      keyQuotes: []
    };
  }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
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
  const text = await askClaude(`Extract 3-5 of the most shareable, quotable lines from this Lakers/NBA article. Look for hot takes, strong opinions, or memorable phrases.

Title: ${context?.title || 'Untitled'}

Article:
${content}

Quotes (one per line):`);
  if (!text) {
    return [];
  }

  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^["']|["']$/g, '').trim())
    .slice(0, 5);
}
