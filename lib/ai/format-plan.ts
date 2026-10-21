/**
 * The AI formatter, built so the writer's words can't change.
 *
 * The AI never writes the story. It sees the draft with every paragraph and
 * sentence numbered and returns a plan: which lines are headings, which
 * words to bold or italicize, which sentences become a list, where to break
 * a long paragraph, which sentence to repeat as a pull quote, and which
 * numbers to show as a table or stat cards. This file builds the formatted
 * story from the writer's original text by following that plan.
 *
 * Anything in the plan that doesn't fit the draft (a word that isn't in the
 * paragraph, a number that isn't in the sentence) is skipped; everything
 * else is applied. The story always comes out as the writer's exact words.
 *
 * Labels the writer approved the AI writing: table column headers and the
 * short label under a stat card. They can't contain a bare number, so a
 * label can never introduce a stat; every value is lifted from the
 * writer's sentence.
 */

type Mark = 'bold' | 'italic'
type Range = { start: number; end: number; mark: Mark }
type Span = { start: number; end: number }

export interface Para {
  text: string
  /** Typed into the draft: "## " heading, "- " bullet, "1. " numbered, "> " quote. */
  kind: 'p' | 'heading' | 'bullet' | 'ordered' | 'quote'
  level?: 2 | 3
  /** Emphasis, as character ranges in `text`. */
  ranges: Range[]
  /** Sentence spans in `text`. */
  sentences: Span[]
}

type DocNode = { type: string; attrs?: Record<string, unknown>; content?: DocNode[]; text?: string; marks?: { type: Mark }[] }

const SENTENCE_BREAK = /(?<=[.!?…]["')\]]?)\s+(?=["'(\[]?[A-Z0-9])/g

function sentenceSpans(text: string): Span[] {
  const spans: Span[] = []
  let start = 0
  for (const match of text.matchAll(SENTENCE_BREAK)) {
    spans.push({ start, end: match.index! })
    start = match.index! + match[0].length
  }
  spans.push({ start, end: text.length })
  return spans.filter((s) => s.end > s.start)
}

/** Splits the draft into paragraphs (one per non-empty line), reading typed markers. */
export function parseDraft(raw: string): Para[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      let rest = line
      let kind: Para['kind'] = 'p'
      let level: 2 | 3 | undefined
      const heading = rest.match(/^(#{1,6})[ \t]+/)
      if (heading) { kind = 'heading'; level = heading[1].length <= 2 ? 2 : 3; rest = rest.slice(heading[0].length) }
      else if (/^(?:[-*•‣◦⁃])[ \t]+/.test(rest)) { kind = 'bullet'; rest = rest.replace(/^\S+[ \t]+/, '') }
      else if (/^\d{1,3}[.)][ \t]+/.test(rest)) { kind = 'ordered'; rest = rest.replace(/^\S+[ \t]+/, '') }
      else if (/^>[ \t]?/.test(rest)) { kind = 'quote'; rest = rest.replace(/^>[ \t]?/, '') }

      // **bold** / __bold__ typed in the draft: keep the words, record the bold.
      const ranges: Range[] = []
      let text = ''
      let last = 0
      for (const m of rest.matchAll(/\*\*(?=\S)([^*]+?)\*\*|__(?=\S)([^_]+?)__/g)) {
        text += rest.slice(last, m.index!)
        const inner = m[1] ?? m[2]
        ranges.push({ start: text.length, end: text.length + inner.length, mark: 'bold' })
        text += inner
        last = m.index! + m[0].length
      }
      text += rest.slice(last)
      return { text, kind, level, ranges, sentences: sentenceSpans(text) }
    })
}

/** The draft as the AI sees it: [P1], [P2]... with <s1>, <s2>... per sentence. */
export function numberedView(paras: Para[]): string {
  return paras
    .map((p, i) => {
      const body = p.sentences.length > 1
        ? p.sentences.map((s, j) => `<s${j + 1}> ${p.text.slice(s.start, s.end)}`).join(' ')
        : p.text
      const tag = p.kind === 'p' ? '' : ` (${p.kind})`
      return `[P${i + 1}]${tag} ${body}`
    })
    .join('\n')
}

// ---------- The plan ---------------------------------------------------------

export interface FormatPlan {
  headings?: { p: number; level?: number }[]
  lists?: { from: number; to?: number; ordered?: boolean }[]
  quotes?: number[]
  breaks?: { p: number; afterSentence: number }[]
  emphasis?: { p: number; text: string; mark?: string }[]
  pullQuote?: { p: number; s: number; after?: number } | null
  tables?: { p: number; s: number; after?: number; headers?: string[]; rows?: string[][] }[]
  statBlocks?: { p: number; s: number; after?: number; stats?: { value?: string; label?: string }[] }[]
}

const ws = (text: string) => text.replace(/[\s ]+/g, ' ').trim()

/** A label the AI may write: short, and no bare numbers (so it can't add a stat). */
export function isValidLabel(label: unknown, maxWords = 4): label is string {
  if (typeof label !== 'string') return false
  const clean = ws(label)
  if (!clean || clean.length > 28) return false
  const words = clean.split(' ')
  if (words.length > maxWords) return false
  return !words.some((word) => /^[$#]?\d[\d.,:/%x-]*$/i.test(word))
}

/** A value lifted from the writer's sentence: present in it, verbatim. */
function liftedFrom(value: unknown, sentence: string): value is string {
  return typeof value === 'string' && ws(value).length > 0 && ws(sentence).includes(ws(value))
}

const int = (value: unknown) => (typeof value === 'number' && Number.isInteger(value) ? value : NaN)

// ---------- Building ---------------------------------------------------------

function textRuns(text: string, from: number, to: number, ranges: Range[]): DocNode[] {
  const cuts = new Set([from, to])
  for (const r of ranges) {
    if (r.end > from && r.start < to) { cuts.add(Math.max(r.start, from)); cuts.add(Math.min(r.end, to)) }
  }
  const points = [...cuts].sort((a, b) => a - b)
  const runs: DocNode[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]]
    const piece = text.slice(a, b)
    if (!piece) continue
    const marks = [...new Set(ranges.filter((r) => r.start <= a && r.end >= b).map((r) => r.mark))].map((type) => ({ type }))
    runs.push(marks.length ? { type: 'text', text: piece, marks } : { type: 'text', text: piece })
  }
  // Trim the outer whitespace of the run so paragraphs don't start or end with spaces.
  if (runs.length) {
    runs[0].text = runs[0].text!.replace(/^\s+/, '')
    runs[runs.length - 1].text = runs[runs.length - 1].text!.replace(/\s+$/, '')
  }
  return runs.filter((r) => r.text)
}

const paragraph = (content: DocNode[]): DocNode => ({ type: 'paragraph', content })
const cellPara = (text: string): DocNode => paragraph([{ type: 'text', text }])

/** Builds the formatted story: the writer's exact words, formatted by the plan. */
export function buildFormattedDoc(paras: Para[], rawPlan: unknown): { type: 'doc'; content: DocNode[] } {
  const plan = (rawPlan && typeof rawPlan === 'object' ? rawPlan : {}) as FormatPlan
  const n = paras.length
  const valid = (p: number) => Number.isInteger(p) && p >= 1 && p <= n
  const sentence = (p: number, s: number) => {
    const para = paras[p - 1]
    const span = para?.sentences[s - 1]
    return span ? para.text.slice(span.start, span.end) : null
  }

  // Emphasis: the exact words must be in the paragraph; first occurrence, no overlaps.
  const ranges: Range[][] = paras.map((p) => [...p.ranges])
  for (const e of (Array.isArray(plan.emphasis) ? plan.emphasis : []).slice(0, 60)) {
    const p = int(e?.p)
    if (!valid(p) || typeof e.text !== 'string' || !e.text.trim()) continue
    const at = paras[p - 1].text.indexOf(e.text)
    if (at < 0) continue
    const r = { start: at, end: at + e.text.length, mark: (e.mark === 'italic' ? 'italic' : 'bold') as Mark }
    if (ranges[p - 1].some((x) => x.start < r.end && r.start < x.end)) continue
    ranges[p - 1].push(r)
  }

  // Block roles for untyped paragraphs.
  const role: (null | { kind: 'heading'; level: 2 | 3 } | { kind: 'quote' })[] = paras.map(() => null)
  for (const h of Array.isArray(plan.headings) ? plan.headings : []) {
    const p = int(h?.p)
    // A heading is one short line: a single sentence of at most 14 words.
    const para = valid(p) ? paras[p - 1] : null
    if (para && para.kind === 'p' && para.sentences.length === 1 && para.text.split(/\s+/).length <= 14) {
      role[p - 1] = { kind: 'heading', level: int(h.level) === 3 ? 3 : 2 }
    }
  }
  for (const q of Array.isArray(plan.quotes) ? plan.quotes : []) {
    const p = int(q)
    if (valid(p) && paras[p - 1].kind === 'p' && !role[p - 1]) role[p - 1] = { kind: 'quote' }
  }

  // Lists: a run of paragraphs (one item each) or one paragraph's sentences.
  const listAt = new Map<number, { to: number; ordered: boolean; bySentence: boolean }>()
  const inList = new Set<number>()
  for (const l of Array.isArray(plan.lists) ? plan.lists : []) {
    const from = int(l?.from)
    const to = Number.isInteger(l?.to) ? (l.to as number) : from
    if (!valid(from) || !valid(to) || to < from || to - from > 29) continue
    let ok = true
    for (let p = from; p <= to; p++) if (paras[p - 1].kind !== 'p' || role[p - 1] || inList.has(p)) ok = false
    const bySentence = from === to
    if (bySentence && paras[from - 1].sentences.length < 2) ok = false
    if (!ok) continue
    listAt.set(from, { to, ordered: Boolean(l.ordered), bySentence })
    for (let p = from; p <= to; p++) inList.add(p)
  }

  // Paragraph breaks at sentence boundaries.
  const breaks: Set<number>[] = paras.map(() => new Set())
  for (const b of Array.isArray(plan.breaks) ? plan.breaks : []) {
    const p = int(b?.p), s = int(b?.afterSentence)
    if (valid(p) && s >= 1 && s < paras[p - 1].sentences.length) breaks[p - 1].add(s)
  }

  // Copies: pull quote, tables, stat cards, placed after a paragraph.
  const copiesAfter = new Map<number, DocNode[]>()
  const place = (after: unknown, fallback: number, node: DocNode) => {
    const at = Math.min(n, Math.max(fallback, Number.isInteger(after) ? (after as number) : fallback))
    copiesAfter.set(at, [...(copiesAfter.get(at) ?? []), node])
  }
  const pq = plan.pullQuote
  if (pq && typeof pq === 'object') {
    const p = int(pq.p), s = int(pq.s)
    const text = valid(p) ? sentence(p, s) : null
    if (text && ws(text).split(' ').length >= 4) {
      place(pq.after, p, { type: 'pullQuote', content: [{ type: 'text', text: ws(text) }] })
    }
  }
  for (const t of (Array.isArray(plan.tables) ? plan.tables : []).slice(0, 2)) {
    const p = int(t?.p), s = int(t?.s)
    const source = valid(p) ? sentence(p, s) : null
    if (!source) continue
    const rows = (Array.isArray(t.rows) ? t.rows : []).filter(Array.isArray).slice(0, 10) as unknown[][]
    const width = rows[0]?.length ?? 0
    if (rows.length === 0 || width < 1 || width > 6) continue
    if (!rows.every((row) => row.length === width && row.every((cell) => liftedFrom(cell, source)))) continue
    const headers = Array.isArray(t.headers) && t.headers.length ? t.headers : null
    if (headers && (headers.length !== width || !headers.every((h) => isValidLabel(h, 3)))) continue
    place(t.after, p, {
      type: 'table',
      content: [
        ...(headers ? [{ type: 'tableRow', content: headers.map((h) => ({ type: 'tableHeader', content: [cellPara(ws(h as string))] })) }] : []),
        ...rows.map((row) => ({ type: 'tableRow', content: row.map((cell) => ({ type: 'tableCell', content: [cellPara(ws(cell as string))] })) })),
      ],
    })
  }
  for (const b of (Array.isArray(plan.statBlocks) ? plan.statBlocks : []).slice(0, 2)) {
    const p = int(b?.p), s = int(b?.s)
    const source = valid(p) ? sentence(p, s) : null
    if (!source) continue
    const stats = (Array.isArray(b.stats) ? b.stats : [])
      .filter((stat) => liftedFrom(stat?.value, source) && /\d/.test(stat.value!) && ws(stat.value!).length <= 16 && isValidLabel(stat?.label))
      .slice(0, 3)
      .map((stat) => ({ value: ws(stat.value!), label: ws(stat.label!) }))
    if (stats.length) place(b.after, p, { type: 'statBlock', attrs: { stats, source: '' } })
  }

  // Emit, in the writer's order.
  const out: DocNode[] = []
  const chunks = (i: number): Span[] => {
    const para = paras[i]
    if (breaks[i].size === 0) return [{ start: 0, end: para.text.length }]
    const result: Span[] = []
    let start = 0
    para.sentences.forEach((s, j) => {
      if (breaks[i].has(j + 1)) { result.push({ start, end: s.end }); start = para.sentences[j + 1].start }
    })
    result.push({ start, end: para.text.length })
    return result
  }
  const flushCopies = (from: number, to: number) => {
    for (let p = from; p <= to; p++) out.push(...(copiesAfter.get(p) ?? []))
  }

  let i = 0
  while (i < n) {
    const p = i + 1
    const para = paras[i]
    const list = listAt.get(p)
    if (list) {
      const items: DocNode[] = list.bySentence
        ? para.sentences.map((s) => ({ type: 'listItem', content: [paragraph(textRuns(para.text, s.start, s.end, ranges[i]))] }))
        : paras.slice(i, list.to).map((q, k) => ({ type: 'listItem', content: [paragraph(textRuns(q.text, 0, q.text.length, ranges[i + k]))] }))
      out.push({ type: list.ordered ? 'orderedList' : 'bulletList', content: items })
      flushCopies(p, list.to)
      i = list.to
      continue
    }
    if (para.kind === 'bullet' || para.kind === 'ordered') {
      // Typed list lines: consecutive ones become one list.
      let j = i
      while (j < n && paras[j].kind === para.kind) j++
      out.push({
        type: para.kind === 'ordered' ? 'orderedList' : 'bulletList',
        content: paras.slice(i, j).map((q, k) => ({ type: 'listItem', content: [paragraph(textRuns(q.text, 0, q.text.length, ranges[i + k]))] })),
      })
      flushCopies(p, j)
      i = j
      continue
    }
    const r = role[i]
    if (para.kind === 'heading' || r?.kind === 'heading') {
      const level = para.kind === 'heading' ? para.level ?? 2 : (r as { level: 2 | 3 }).level
      out.push({ type: 'heading', attrs: { level }, content: textRuns(para.text, 0, para.text.length, ranges[i]) })
    } else if (para.kind === 'quote' || r?.kind === 'quote') {
      out.push({ type: 'blockquote', content: chunks(i).map((c) => paragraph(textRuns(para.text, c.start, c.end, ranges[i]))) })
    } else {
      out.push(...chunks(i).map((c) => paragraph(textRuns(para.text, c.start, c.end, ranges[i]))))
    }
    flushCopies(p, p)
    i += 1
  }

  return { type: 'doc', content: out.filter((node) => node.type !== 'paragraph' || (node.content?.length ?? 0) > 0) }
}
