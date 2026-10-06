import Image, { type ImageOptions } from '@tiptap/extension-image'

export type ImageSize = 'column' | 'wide' | 'full'

export const IMAGE_SIZES: { value: ImageSize; label: string; hint: string }[] = [
  { value: 'column', label: 'Column', hint: 'Same width as the text' },
  { value: 'wide', label: 'Wide', hint: 'Wider than the text on big screens' },
  { value: 'full', label: 'Full width', hint: 'Edge to edge. For big landscape moments' },
]

function isImageSize(value: unknown): value is ImageSize {
  return value === 'column' || value === 'wide' || value === 'full'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleImage: {
      setArticleImage: (attrs: { src: string; alt?: string | null; caption?: string | null; size?: ImageSize }) => ReturnType
    }
  }
}

/**
 * The image node used by both the editor and the article page, so a writer
 * sees the same figure, caption and width a reader will.
 *
 * Adds two attributes to the stock image node:
 * - caption: shown under the image. Before this, the editor stored a caption
 *   as a separate italic paragraph after the image; components/article/
 *   ArticleBody.tsx still folds those older captions in when rendering.
 * - size: column, wide (the default, and what every older image gets) or
 *   full. The article stylesheet decides what each means at each width.
 */
export const ArticleImage = Image.extend<ImageOptions>({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        rendered: false,
        parseHTML: (element) =>
          element.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || null,
      },
      size: {
        default: 'wide',
        rendered: false,
        parseHTML: (element) => {
          const size = element.closest('figure')?.getAttribute('data-size')
          return isImageSize(size) ? size : 'wide'
        },
      },
    }
  },

  parseHTML() {
    // Pasted base64 images are refused, as in the stock node: they would be
    // saved into the article row itself.
    return [{ tag: 'img[src]:not([src^="data:"])' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const caption = typeof node.attrs.caption === 'string' ? node.attrs.caption.trim() : ''
    const size = isImageSize(node.attrs.size) ? node.attrs.size : 'wide'
    // Uploaded images are often saved without alt text; the caption is the
    // best description available.
    const { title: _title, ...imgAttrs } = HTMLAttributes
    if (!imgAttrs.alt && caption) imgAttrs.alt = caption
    const figure = { 'data-type': 'image', 'data-size': size, class: 'tdd-figure' }
    return caption
      ? ['figure', figure, ['img', imgAttrs], ['figcaption', {}, caption]]
      : ['figure', figure, ['img', imgAttrs]]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setArticleImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
