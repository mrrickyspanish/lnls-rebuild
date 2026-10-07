import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pullQuote: {
      togglePullQuote: () => ReturnType
    }
  }
}

/**
 * One standout line, set big in the display face to break up a long read.
 *
 * Kept separate from the ordinary quote (StarterKit's blockquote), which is
 * for quoted passages: a player's or coach's words that run a sentence or
 * more. Before this, every blockquote was styled as a pull quote, so a long
 * passage rendered in giant type. Older articles keep their blockquotes,
 * which now read as ordinary quotes.
 */
export const PullQuote = Node.create({
  name: 'pullQuote',
  group: 'block',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote[data-type="pull-quote"]', contentElement: 'p', priority: 60 }]
  },

  renderHTML() {
    return ['blockquote', { 'data-type': 'pull-quote', class: 'tdd-pullquote' }, ['p', 0]]
  },

  addCommands() {
    return {
      togglePullQuote:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, 'paragraph'),
    }
  },
})
