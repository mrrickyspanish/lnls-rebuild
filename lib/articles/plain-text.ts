import type { JSONContent } from '@tiptap/core'

const MEDIA = new Set(['image', 'videoEmbed', 'twitterEmbed'])

/**
 * A story's text as plain paragraphs, for handing what's already in the
 * editor to the AI formatter. Media can't be expressed as text, so it's
 * counted instead (see countMedia) and the writer is told before applying.
 */
export function docToPlainText(node: JSONContent | null | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  if (node.type && MEDIA.has(node.type)) return ''
  if (node.type === 'statBlock') {
    const stats = Array.isArray(node.attrs?.stats) ? node.attrs.stats : []
    return stats.map((s: { value?: string; label?: string }) => `${s.value ?? ''} ${s.label ?? ''}`.trim()).join('\n')
  }
  const children = (node.content ?? []).map((child) => docToPlainText(child))
  if (node.type === 'listItem') return `- ${children.join(' ').trim()}`
  if (node.type === 'tableRow') return children.join(' | ')
  const inline = node.type === 'paragraph' || node.type === 'heading' || node.type === 'pullQuote' || node.type === 'calloutCard'
  const joined = children.join(inline ? '' : '\n\n')
  return joined.replace(/\n{3,}/g, '\n\n').trim()
}

/** Images, videos and embedded posts in a story. */
export function countMedia(node: JSONContent | null | undefined): number {
  if (!node) return 0
  const self = node.type && MEDIA.has(node.type) ? 1 : 0
  return self + (node.content ?? []).reduce((sum, child) => sum + countMedia(child), 0)
}
