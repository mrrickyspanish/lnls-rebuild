import { Table } from '@tiptap/extension-table'

/**
 * The published version of the table node: same schema as the editor's, but
 * wrapped in a scroll container so a wide stat table scrolls sideways inside
 * the text column on a phone instead of pushing the whole page wider.
 */
export const PublishedTable = Table.extend({
  renderHTML(props) {
    const table = this.parent?.(props)
    return ['div', { class: 'tdd-table' }, table as any]
  },
})
