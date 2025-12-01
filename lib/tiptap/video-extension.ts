import { Node, mergeAttributes } from '@tiptap/core'
import type { CommandProps } from '@tiptap/react'

export type SupportedVideoProvider = 'youtube' | 'vimeo' | 'streamable'
function parseStreamable(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '');
  if (host !== 'streamable.com') return null;
  // Streamable URLs: https://streamable.com/{id}
  const videoId = url.pathname.split('/').filter(Boolean)[0];
  if (!videoId) return null;
  return {
    src: `https://streamable.com/e/${videoId}`,
    provider: 'streamable',
    title: 'Streamable video',
  };
}

export interface VideoAttributes {
  src: string
  provider: SupportedVideoProvider
  title?: string
}

function parseYouTube(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '')
  let videoId = ''

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    videoId = url.searchParams.get('v') || ''
  }

  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1)
  }

  if (!videoId) return null

  return {
    src: `https://www.youtube.com/embed/${videoId}`,
    provider: 'youtube',
    title: 'YouTube video',
  }
}

function parseVimeo(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '')
  if (host !== 'vimeo.com') return null

  const videoId = url.pathname.split('/').filter(Boolean)[0]
  if (!videoId) return null

  return {
    src: `https://player.vimeo.com/video/${videoId}`,
    provider: 'vimeo',
    title: 'Vimeo video',
  }
}

function getVideoAttributes(src: string): VideoAttributes | null {
  if (!src) return null;
  try {
    const url = new URL(src);
    return parseYouTube(url) || parseVimeo(url) || parseStreamable(url);
  } catch {
    return null;
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',

  group: 'block',

  atom: true,

  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      provider: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, provider, title } = HTMLAttributes
    if (!src || !provider) return ['div']

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-video-embed': provider,
        class: 'tiptap-video-wrapper',
      }),
      ['div', { class: 'relative w-full pt-[56.25%]' },
        ['iframe', {
          src,
          title: title || 'Embedded video player',
          class: 'absolute inset-0 h-full w-full rounded-lg border-0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
          loading: 'lazy',
        }]
      ]
    ]
  },

  addCommands() {
    return {
      setVideo:
        ({ src }) =>
        ({ editor }: CommandProps) => {
          const attrs = getVideoAttributes(src)
          if (!attrs) return false
          return editor.commands.insertContent({
            type: this.name,
            attrs,
          })
        },
    }
  },
})
