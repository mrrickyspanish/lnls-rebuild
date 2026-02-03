/**
 * Custom TipTap extension for embedding videos
 * Supports YouTube, Vimeo, Streamable, and direct video files (.mp4, .webm, .mov)
 */

import { Node } from '@tiptap/core'

interface VideoAttributes {
  src: string
  provider: 'youtube' | 'vimeo' | 'streamable' | 'file'
  title?: string
  size?: 'small' | 'medium' | 'full'
}

/**
 * Parse YouTube URL and extract video ID
 */
function parseYouTube(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '')
  
  // youtube.com/watch?v=VIDEO_ID
  if (host === 'youtube.com' && url.searchParams.has('v')) {
    const videoId = url.searchParams.get('v')
    if (!videoId) return null
    
    return {
      src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`,
      provider: 'youtube',
      title: 'YouTube video',
    }
  }
  
  // youtu.be/VIDEO_ID
  if (host === 'youtu.be') {
    const videoId = url.pathname.slice(1).split('?')[0]
    if (!videoId) return null
    
    return {
      src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`,
      provider: 'youtube',
      title: 'YouTube video',
    }
  }
  
  return null
}

/**
 * Parse Vimeo URL and extract video ID
 */
function parseVimeo(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '')
  
  if (host !== 'vimeo.com') return null
  
  // vimeo.com/VIDEO_ID
  const videoId = url.pathname.split('/').filter(Boolean)[0]
  if (!videoId) return null
  
  return {
    src: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&playsinline=1`,
    provider: 'vimeo',
    title: 'Vimeo video',
  }
}

/**
 * Parse Streamable URL and extract video ID
 */
function parseStreamable(url: URL): VideoAttributes | null {
  const host = url.hostname.replace('www.', '')
  
  if (host !== 'streamable.com') return null
  
  // streamable.com/VIDEO_ID or streamable.com/e/VIDEO_ID
  const parts = url.pathname.split('/').filter(Boolean)
  const videoId = parts[parts.length - 1]
  if (!videoId) return null
  
  return {
    src: `https://streamable.com/e/${videoId}?autoplay=1&muted=1`,
    provider: 'streamable',
    title: 'Streamable video',
  }
}

/**
 * Parse direct video file URLs (e.g., .mp4, .webm, .mov)
 */
function parseDirectFile(url: URL): VideoAttributes | null {
  const pathname = url.pathname.toLowerCase()
  const allowed = ['.mp4', '.webm', '.mov']
  const matches = allowed.some(ext => pathname.endsWith(ext))
  if (!matches) return null

  return {
    src: url.toString(),
    provider: 'file',
    title: 'Video file',
  }
}

/**
 * Get video attributes from URL
 */
function getVideoAttributes(src: string): VideoAttributes | null {
  try {
    const url = new URL(src)
    return (
      parseYouTube(url) ||
      parseVimeo(url) ||
      parseStreamable(url) ||
      parseDirectFile(url)
    )
  } catch {
    return null
  }
}

/**
 * VideoEmbed TipTap Extension
 * Creates an iframe embed for supported video platforms
 */
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  
  group: 'block',
  
  atom: true,
  
  selectable: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.querySelector('iframe')?.getAttribute('src'),
      },
      provider: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-video-provider'),
      },
      title: {
        default: null,
        parseHTML: (element) => element.querySelector('iframe')?.getAttribute('title'),
      },
      size: {
        default: 'medium',
        parseHTML: (element) => element.getAttribute('data-video-size'),
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    const { src, provider, title, size = 'medium' } = HTMLAttributes

    // Size classes: small = max-w-md (448px), medium = max-w-2xl (672px), full = w-full
    const sizeClass = size === 'small' ? 'max-w-md' : size === 'medium' ? 'max-w-2xl' : 'w-full'

    if (provider === 'file') {
      return [
        'div',
        {
          'data-video-embed': provider,
          'data-video-provider': provider,
          'data-video-size': size,
          class: `tiptap-video-wrapper my-6 ${sizeClass} mx-auto`,
        },
        [
          'div',
          { class: 'relative w-full bg-black rounded-lg overflow-hidden' },
          [
            'video',
            {
              src,
              title: title || 'Video',
              class: 'w-full h-auto',
              controls: 'true',
              autoplay: 'true',
              muted: 'true',
              playsinline: 'true',
              preload: 'metadata',
            },
          ],
        ],
      ]
    }

    return [
      'div',
      {
        'data-video-embed': provider,
        'data-video-provider': provider,
        'data-video-size': size,
        class: `tiptap-video-wrapper my-6 ${sizeClass} mx-auto`,
      },
      [
        'div',
        { class: 'relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden' },
          [
            'iframe',
            {
              src,
              title: title || 'Video embed',
              class: 'absolute inset-0 h-full w-full border-0',
              frameborder: '0',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowfullscreen: 'true',
              loading: 'lazy',
            },
          ],
      ],
    ]
  },
  
  // @ts-expect-error - TipTap command type inference issue
  addCommands() {
    return {
      setVideoEmbed:
        (url: string, size?: 'small' | 'medium' | 'full') =>
        ({ commands }: any) => {
          const attributes = getVideoAttributes(url)
          
          if (!attributes) {
            console.error('Unsupported video URL:', url)
            return false
          }
          
          return commands.insertContent({
            type: this.name,
            attrs: { ...attributes, size: size || 'medium' },
          })
        },
    }
  },
})

export default VideoEmbed
