/**
 * Every piece on the site carries one of four labels, so a reader always
 * knows whether they're reading a take, a breakdown, news, or a rumor.
 * The editor, the story page, the story cards and /standards all read this
 * list. The definitions are the ones /standards publishes.
 */
export const PIECE_TYPES = [
  {
    value: 'opinion',
    label: 'Opinion',
    definition: 'My take. An argument I’m making, backed by what I’ve seen and what I know.',
    editorHint: 'Your take or argument.',
    // schema.org subtype, so search engines can tell a take from news.
    schemaType: 'OpinionNewsArticle',
  },
  {
    value: 'analysis',
    label: 'Analysis',
    definition: 'A breakdown of what happened and why: film, numbers, history. I’ll tell you what I think it means, but the evidence leads.',
    editorHint: 'Breaking down what happened and why.',
    schemaType: 'AnalysisNewsArticle',
  },
  {
    value: 'report',
    label: 'Report',
    definition: 'News: what happened, who said it, and where it came from, sourced and linked.',
    editorHint: 'Straight news, sourced.',
    schemaType: 'ReportageNewsArticle',
  },
  {
    value: 'rumor',
    label: 'Rumor',
    definition: 'Something being reported that isn’t confirmed yet. I always name who’s reporting it, and I come back to it when it’s settled.',
    editorHint: 'Not confirmed. You’ll name who’s reporting it.',
    schemaType: 'NewsArticle',
  },
] as const

export type PieceType = (typeof PIECE_TYPES)[number]['value']

export function isPieceType(value: unknown): value is PieceType {
  return PIECE_TYPES.some((type) => type.value === value)
}

export function pieceTypeInfo(value: unknown) {
  return PIECE_TYPES.find((type) => type.value === value) ?? null
}

export const NOTE_KINDS = [
  { value: 'update', label: 'Update' },
  { value: 'correction', label: 'Correction' },
] as const

export type NoteKind = (typeof NOTE_KINDS)[number]['value']

export function isNoteKind(value: unknown): value is NoteKind {
  return NOTE_KINDS.some((kind) => kind.value === value)
}

export function noteKindLabel(value: unknown) {
  return NOTE_KINDS.find((kind) => kind.value === value)?.label ?? 'Update'
}
