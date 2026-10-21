import { requireAdmin } from '@/lib/auth/guard'
import { NextRequest, NextResponse } from 'next/server';
import { askClaude } from '@/lib/ai/claude';
import { buildFormattedDoc, numberedView, parseDraft } from '@/lib/ai/format-plan';
import { plainDocFrom, verifyFormattedDoc } from '@/lib/ai/format-verify';

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
// The writer's words are untouchable, so the AI never writes the story. It
// sees the draft with every paragraph and sentence numbered and returns a
// formatting plan; lib/ai/format-plan.ts builds the story from the writer's
// original text by following it, skipping anything that doesn't fit. The
// result is always the writer's exact words, formatted. verifyFormattedDoc
// re-checks it as a safety net (a bug, not the AI, is the only way it could
// fail), falling back to the plain draft.
async function formatArticle(content: string, context?: any): Promise<{ doc: AnyRecord; suggestions: FormatSuggestions }> {
  const currentHeadline = typeof context?.title === 'string' && context.title.trim() ? context.title.trim() : null;
  const paras = parseDraft(content);
  if (paras.length === 0) throw new Error('Paste a draft to format.');

  const text = await askClaude(`You format drafts for The Daily Dribble, Rick Barnes Jr.'s one-writer publication. You are a formatter, not an editor. Your only job is structure. The author's words are untouchable.

You never write or rewrite the story. The draft below is split into numbered paragraphs [P1], [P2]... and sentences <s1>, <s2>... You return a formatting PLAN that points at them, and the site applies it to the author's own text. Anything that doesn't match the draft exactly is ignored.

What the plan can do:
- headings: turn one of the author's own short lines into a heading (level 2, or 3 for a sub-section). Use for lines that already read like a section title. Never for a normal sentence in the middle of the argument.
- emphasis: bold or italicize exact words already in a paragraph (copy them exactly, same capitalization). Use sparingly: key names, key numbers, the punchline phrase.
- lists: turn a run of short paragraphs into a list ({"from": 5, "to": 8}), or one paragraph's sentences into list items ({"from": 4}). Only where the author is already listing things. "ordered": true for steps or rankings.
- quotes: paragraph numbers that are a quoted passage (someone else's words).
- breaks: split a long paragraph into two after a sentence, where the thought turns.
- pullQuote: one sentence worth repeating big, by paragraph and sentence number, placed "after" a later paragraph. It's a copy; the sentence also stays where it is.
- tables: from one sentence with several stats. Cells must be the exact words and numbers from that sentence. You may write short column headers (1-3 words, no numbers on their own, e.g. "Stat", "Made-Attempted", "3PT").
- statBlocks: 1-3 big-number cards from one sentence. Each value is the exact number text from the sentence (e.g. "81", "28 of 46"); you may write a short label (1-4 words, no numbers on their own, e.g. "Points").

Never invent a number, never compute one (no percentages, totals or averages), and never change the author's words, slang, typos or style. Use only what the draft supports; an empty plan is fine for a short piece.

Also suggest, separately (these are offered to the writer, never put into the story):
- headlines: 3 headline options, under 90 characters each. ${currentHeadline ? `The writer's working headline is: "${currentHeadline}".` : 'The writer has no headline yet.'}
- summary: 1-2 sentences (under 280 characters) shown under the headline.
- metaDescription: under 155 characters, for search results and link previews.
- Every number in a suggestion must appear in the draft exactly.

DRAFT:
${numberedView(paras)}

Return ONLY a JSON object, no markdown, no explanations:
{
  "plan": {
    "headings": [{"p": 1, "level": 2}],
    "emphasis": [{"p": 2, "text": "exact words", "mark": "bold"}],
    "lists": [{"from": 5, "to": 7, "ordered": false}],
    "quotes": [],
    "breaks": [{"p": 2, "afterSentence": 2}],
    "pullQuote": {"p": 2, "s": 1, "after": 4},
    "tables": [{"p": 3, "s": 1, "after": 3, "headers": ["Stat", "Made-Attempted"], "rows": [["from the field", "28 of 46"], ["from three", "7 of 13"]]}],
    "statBlocks": [{"p": 2, "s": 1, "after": 2, "stats": [{"value": "81", "label": "Points"}]}]
  },
  "headlines": ["Option one", "Option two", "Option three"],
  "summary": "One or two sentences.",
  "metaDescription": "Under 155 characters."
}`, { maxTokens: 16000 });

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(extractJsonObject(text ?? ''));
  } catch (error) {
    // Unreadable answer: the draft still comes back, with paragraph breaks.
    console.error('Failed to parse AI formatting plan:', error);
  }

  const plan = isRecord(parsed) ? parsed.plan : null;
  let doc = buildFormattedDoc(paras, plan) as AnyRecord;
  const check = verifyFormattedDoc(doc as any, content);
  if (!check.ok) {
    console.error('Formatter safety net tripped (builder bug); returning the plain draft:', check.reason);
    doc = plainDocFrom(content) as AnyRecord;
  } else {
    doc = check.doc as AnyRecord;
  }
  return { doc, suggestions: sanitizeSuggestions(parsed, content, doc) };
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
