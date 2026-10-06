import { Node } from '@tiptap/core'

export type Stat = { value: string; label: string }
export type StatBlockAttrs = { stats: Stat[]; source: string }

export const MAX_STATS = 3

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    statBlock: {
      setStatBlock: (attrs: StatBlockAttrs) => ReturnType
    }
  }
}

/** Keeps only complete stats, trimmed, at most MAX_STATS. */
export function cleanStats(value: unknown): Stat[] {
  if (!Array.isArray(value)) return []
  return value
    .map((stat) => ({
      value: typeof stat?.value === 'string' ? stat.value.trim() : '',
      label: typeof stat?.label === 'string' ? stat.label.trim() : '',
    }))
    .filter((stat) => stat.value && stat.label)
    .slice(0, MAX_STATS)
}

function parseStats(element: HTMLElement): Stat[] {
  try {
    return cleanStats(JSON.parse(element.getAttribute('data-stats') || '[]'))
  } catch {
    return []
  }
}

/**
 * One to three big numbers with a label under each ("31.4" / "Points per
 * game"), plus an optional source line. The sports-desk way to land a stat
 * without burying it in a sentence. Atom node: edited through a dialog in
 * the editor, never typed into.
 */
export const StatBlock = Node.create({
  name: 'statBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      stats: {
        default: [],
        rendered: false,
        parseHTML: (element) => parseStats(element),
      },
      source: {
        default: '',
        rendered: false,
        parseHTML: (element) => element.getAttribute('data-source') || '',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="stat-block"]' }]
  },

  renderHTML({ node }) {
    const stats = cleanStats(node.attrs.stats)
    const source = typeof node.attrs.source === 'string' ? node.attrs.source.trim() : ''
    const children: any[] = stats.map((stat) => [
      'div',
      { class: 'tdd-stat' },
      ['span', { class: 'tdd-stat-value' }, stat.value],
      ['span', { class: 'tdd-stat-label' }, stat.label],
    ])
    if (source) children.push(['p', { class: 'tdd-stats-source' }, `Source: ${source}`])
    return [
      'div',
      {
        'data-type': 'stat-block',
        'data-count': String(Math.max(stats.length, 1)),
        'data-stats': JSON.stringify(stats),
        ...(source ? { 'data-source': source } : {}),
        class: 'tdd-stats',
      },
      ...children,
    ]
  },

  addCommands() {
    return {
      setStatBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { stats: cleanStats(attrs.stats), source: attrs.source.trim() },
          }),
    }
  },
})
