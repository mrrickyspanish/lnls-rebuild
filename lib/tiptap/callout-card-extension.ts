import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    calloutCard: {
      toggleCalloutCard: () => ReturnType
    }
  }
}

export const CalloutCard = Node.create({
  name: 'calloutCard',

  group: 'block',

  content: 'inline*',

  defining: true,

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout-card"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout-card',
        class: 'callout-card',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      toggleCalloutCard:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph')
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCalloutCard(),
    }
  },
})
