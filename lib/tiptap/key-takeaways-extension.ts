import { Node } from '@tiptap/core'

export const DEFAULT_TAKEAWAYS_TITLE = 'The short version'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    keyTakeaways: {
      insertKeyTakeaways: (title: string) => ReturnType
    }
  }
}

/**
 * A titled box holding one bullet list: the "short version" for readers who
 * skim. Usually placed near the top of a story. The bullets are typed right
 * in the editor; the title is set through a dialog.
 */
export const KeyTakeaways = Node.create({
  name: 'keyTakeaways',
  group: 'block',
  content: 'bulletList',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: DEFAULT_TAKEAWAYS_TITLE,
        rendered: false,
        parseHTML: (element) => element.getAttribute('data-title') || DEFAULT_TAKEAWAYS_TITLE,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'aside[data-type="key-takeaways"]', contentElement: '.tdd-takeaways-body' }]
  },

  renderHTML({ node }) {
    const title =
      (typeof node.attrs.title === 'string' && node.attrs.title.trim()) || DEFAULT_TAKEAWAYS_TITLE
    return [
      'aside',
      { 'data-type': 'key-takeaways', 'data-title': title, class: 'tdd-takeaways' },
      ['p', { class: 'tdd-takeaways-title', contenteditable: 'false' }, title],
      ['div', { class: 'tdd-takeaways-body' }, 0],
    ]
  },

  addCommands() {
    return {
      insertKeyTakeaways:
        (title) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { title: title.trim() || DEFAULT_TAKEAWAYS_TITLE },
            content: [
              {
                type: 'bulletList',
                content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }],
              },
            ],
          }),
    }
  },
})
