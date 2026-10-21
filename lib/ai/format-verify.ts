/**
 * The AI formatter's guarantee: it may add structure, never change words.
 *
 * After the model formats a draft, this checks the result against what the
 * writer pasted, word by word:
 *
 * - The story itself (paragraphs, headings, lists, quote blocks, in order)
 *   must contain exactly the writer's words in exactly the writer's order.
 *   Only whitespace, line breaks and formatting may differ.
 * - A pull quote must be a word-for-word copy of one of the writer's
 *   sentences. One that isn't is dropped (it's a copy, so no words are lost).
 * - A stats table must take every cell from a single sentence of the
 *   writer's, verbatim, with headers that are generic ("Stat", "Value") or
 *   left off. One that doesn't is dropped.
 *
 * Any word-level difference in the story rejects the whole result.
 */

type Node = { type?: string; text?: string; content?: Node[]; attrs?: Record<string, unknown>; marks?: { type?: string }[] }

/** Block types the formatter may use. Everything else is an invented block. */
const STORY_BLOCKS = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote'])
const COPY_BLOCKS = new Set(['pullQuote', 'table'])
const GENERIC_HEADERS = new Set(['', 'stat', 'stats', 'value', 'values'])

/** Plain names for blocks the formatter isn't allowed to add. */
const BLOCK_NAMES: Record<string, string> = {
  keyTakeaways: 'a takeaways box',
  statBlock: 'a stat block',
  calloutCard: 'a callout box',
  image: 'an image',
  videoEmbed: 'a video',
  twitterEmbed: 'an embedded post',
}

export function disallowedBlockReason(type: string) {
  return `added ${BLOCK_NAMES[type] ?? `a "${type}" block`}, which isn't allowed (it isn't your words)`
}

/**
 * Only differences that aren't word-level: runs of whitespace (spaces, line
 * breaks, non-breaking spaces) and curly vs straight quote marks, which are
 * the same character to a reader and get swapped by editors and keyboards.
 */
export function normalizeForCompare(text: string): string {
  return text
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[\s   ]+/g, ' ')
    .trim()
}

/**
 * Formatting markers already typed into the draft (bullets, list numbers,
 * markdown headings, quote arrows, **bold** / __bold__) become real
 * structure in the result, so they aren't words to compare.
 */
export function rawForCompare(raw: string): string {
  return raw
    .replace(/^[ \t]*(?:[-*\u2022\u2023\u25E6\u2043]|\d{1,3}[.)])[ \t]+/gm, '')
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/\*\*(?=\S)([^*]+?)\*\*/g, '$1')
    .replace(/__(?=\S)([^_]+?)__/g, '$1')
}

function words(text: string): string[] {
  const normal = normalizeForCompare(text)
  return normal ? normal.split(' ') : []
}

/** Text of an inline run: text nodes joined as-is, hard breaks as spaces. */
function inlineText(nodes: Node[] | undefined): string {
  return (nodes ?? []).map((n) => (n.type === 'hardBreak' ? ' ' : n.text ?? '')).join('')
}

/** All text in a block, in reading order, blocks separated by spaces. */
function blockText(node: Node): string {
  if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'pullQuote') return inlineText(node.content)
  return (node.content ?? []).map(blockText).join(' ')
}

/** The writer's sentences, for checking pull quotes and stats tables. */
export function sentencesOf(raw: string): string[] {
  // A line break always ends a sentence: a headline or a fragment on its own
  // line has no period, and would otherwise run into the next sentence.
  return raw
    .split(/\r?\n/)
    .flatMap((line) => normalizeForCompare(line).split(/(?<=[.!?…]["')\]]?)\s+(?=["'(\[]?[A-Z0-9])/))
    .map((s) => s.trim())
    .filter(Boolean)
}

function stripOuterQuotes(text: string) {
  return text.replace(/^["']+|["']+$/g, '').trim()
}

function isValidPullQuote(node: Node, sentences: string[]): boolean {
  const quote = stripOuterQuotes(normalizeForCompare(inlineText(node.content)))
  if (words(quote).length < 4) return false
  return sentences.some((sentence) => stripOuterQuotes(sentence) === quote || sentence === quote)
}

function cellText(cell: Node): string {
  return normalizeForCompare((cell.content ?? []).map(blockText).join(' '))
}

function isValidStatsTable(node: Node, sentences: string[]): boolean {
  const rows = (node.content ?? []).filter((row) => row.type === 'tableRow')
  if (rows.length === 0) return false
  const bodyCells: string[] = []
  for (const row of rows) {
    for (const cell of row.content ?? []) {
      const text = cellText(cell)
      if (cell.type === 'tableHeader') {
        if (!GENERIC_HEADERS.has(text.toLowerCase())) return false
      } else if (text) {
        bodyCells.push(text)
      }
    }
  }
  if (bodyCells.length === 0) return false
  return sentences.some((sentence) => bodyCells.every((cell) => sentence.includes(cell)))
}

export interface FormatCheck {
  ok: boolean
  /** The doc with any invalid pull quotes or tables removed (copies only). */
  doc: { type: 'doc'; content: Node[] }
  /** Plain-language reason when rejected, e.g. 'changed "gonna" to "going to"'. */
  reason?: string
  dropped: { pullQuotes: number; tables: number }
}

/**
 * Names the first difference as precisely as it can: the smallest stretch
 * of words that, once skipped on either side, lets the two texts line up
 * again. 'changed "ain't" to "is not"', 'added words: "The Box Score"',
 * 'left out: "Man, I ain't never..."'.
 */
function describeDifference(expected: string[], actual: string[]): string {
  let i = 0
  while (i < expected.length && i < actual.length && expected[i] === actual[i]) i++
  const window = (a: string[], from: number) => a.slice(from, from + 4).join(' ')
  const realigns = (dx: number, dy: number) =>
    i + dx <= expected.length && i + dy <= actual.length && window(expected, i + dx) === window(actual, i + dy)
  const quote = (a: string[], from: number, to: number) => {
    const span = a.slice(from, Math.min(to, from + 12)).join(' ')
    return `"${span}${to - from > 12 ? '...' : ''}"`
  }

  for (let total = 1; total <= 60; total++) {
    for (let dx = 0; dx <= total; dx++) {
      const dy = total - dx
      if (!realigns(dx, dy)) continue
      if (dx === 0) {
        // "The Box Score The stat line" vs "The stat line": report "The Box
        // Score", not "Box Score The", by sliding to the earliest start.
        let at = i
        while (at > 0 && actual[at - 1] === actual[at - 1 + dy]) at--
        return `added words: ${quote(actual, at, at + dy)}`
      }
      if (dy === 0) {
        let at = i
        while (at > 0 && expected[at - 1] === expected[at - 1 + dx]) at--
        return `left out: ${quote(expected, at, at + dx)}`
      }
      return `changed ${quote(expected, i, i + dx)} to ${quote(actual, i, i + dy)}`
    }
  }
  const was = expected.slice(i, i + 6).join(' ')
  const now = actual.slice(i, i + 6).join(' ')
  if (!now) return `left out words starting at "${was}"`
  if (!was) return `added words: "${now}"`
  return `changed "${was}" to "${now}"`
}

/** Checks a formatted TipTap doc against the writer's raw text. */
export function verifyFormattedDoc(doc: { content?: Node[] } | null | undefined, rawInput: string): FormatCheck {
  const raw = rawForCompare(rawInput)
  const sentences = sentencesOf(raw)
  const content = Array.isArray(doc?.content) ? doc!.content : []
  const kept: Node[] = []
  const dropped = { pullQuotes: 0, tables: 0 }
  let pullQuotes = 0

  for (const node of content) {
    if (node.type === 'pullQuote') {
      if (pullQuotes === 0 && isValidPullQuote(node, sentences)) { kept.push(node); pullQuotes += 1 } else dropped.pullQuotes += 1
      continue
    }
    if (node.type === 'table') {
      if (isValidStatsTable(node, sentences)) kept.push(node)
      else dropped.tables += 1
      continue
    }
    if (!STORY_BLOCKS.has(node.type ?? '')) {
      return { ok: false, doc: { type: 'doc', content: kept }, reason: disallowedBlockReason(node.type ?? 'unknown'), dropped }
    }
    kept.push(node)
  }

  const story = kept.filter((node) => !COPY_BLOCKS.has(node.type ?? '')).map(blockText).join(' ')
  const expected = words(raw)
  const actual = words(story)
  const same = expected.length === actual.length && expected.every((word, i) => word === actual[i])
  if (!same) {
    return { ok: false, doc: { type: 'doc', content: kept }, reason: describeDifference(expected, actual), dropped }
  }
  return { ok: true, doc: { type: 'doc', content: kept }, dropped }
}

/**
 * The writer's text exactly as written, one paragraph per line: what the
 * formatter returns when the AI's version is rejected.
 */
export function plainDocFrom(rawInput: string): { type: 'doc'; content: Node[] } {
  const paragraphs = rawForCompare(rawInput).split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return {
    type: 'doc',
    content: paragraphs.length
      ? paragraphs.map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] }))
      : [{ type: 'paragraph' }],
  }
}
