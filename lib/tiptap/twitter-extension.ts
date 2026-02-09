import { Node } from '@tiptap/core'

interface TwitterAttributes {
  url: string
  tweetId: string
}

export function parseTweetUrl(input: string): TwitterAttributes | null {
  try {
    const url = new URL(input)
    const host = url.hostname.replace('www.', '')
    if (host !== 'twitter.com' && host !== 'x.com' && host !== 'mobile.twitter.com') {
      return null
    }

    const segments = url.pathname.split('/').filter(Boolean)
    const statusIndex = segments.findIndex(segment => segment === 'status' || segment === 'statuses')
    if (statusIndex === -1 || !segments[statusIndex + 1]) return null

    const tweetId = segments[statusIndex + 1]
    if (!/^[0-9]+$/.test(tweetId)) return null

    const username = segments[0]
    const canonicalUrl = username
      ? `https://twitter.com/${username}/status/${tweetId}`
      : `https://twitter.com/i/web/status/${tweetId}`

    return { url: canonicalUrl, tweetId }
  } catch {
    return null
  }
}

export const TwitterEmbed = Node.create({
  name: 'twitterEmbed',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      url: {
        default: null,
        parseHTML: (element) => element.querySelector('a')?.getAttribute('href'),
      },
      tweetId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-twitter-embed'),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter-embed]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { url, tweetId } = HTMLAttributes

    return [
      'div',
      {
        'data-twitter-embed': tweetId,
        class: 'tiptap-twitter-embed my-6',
      },
      [
        'blockquote',
        {
          class: 'twitter-tweet',
          'data-dnt': 'true',
        },
        ['a', { href: url }, url],
      ],
    ]
  },

  // @ts-expect-error - TipTap command type inference issue
  addCommands() {
    return {
      setTwitterEmbed:
        (url: string) =>
        ({ commands }: any) => {
          const attributes = parseTweetUrl(url)

          if (!attributes) {
            console.error('Unsupported tweet URL:', url)
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },
})

export default TwitterEmbed
