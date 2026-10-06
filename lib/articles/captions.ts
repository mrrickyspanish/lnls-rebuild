import type { JSONContent } from '@tiptap/core'

/**
 * Older articles stored an image caption as a separate paragraph, set
 * entirely in italics, directly after the image. On the page that read as a
 * stray italic sentence, and in the editor it could not be told apart from
 * body text. This folds such a paragraph into the image's `caption`
 * attribute, the way the current editor saves captions.
 *
 * Used when rendering (components/article/ArticleBody.tsx), so stored
 * articles display correctly without being rewritten, and when an article is
 * opened in the editor (components/admin/ArticleForm.tsx), so the next save
 * stores the caption the new way.
 */
function captionText(node: JSONContent | undefined): string | null {
  if (!node || node.type !== 'paragraph' || !node.content?.length) return null
  const allItalic = node.content.every(
    (part) => part.type === 'text' && part.marks?.some((mark) => mark.type === 'italic')
  )
  if (!allItalic) return null
  const text = node.content.map((part) => part.text ?? '').join('').trim()
  return text || null
}

export function attachLegacyCaptions(node: JSONContent): JSONContent {
  if (!node.content) return node
  const children = node.content
  const next: JSONContent[] = []
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.type === 'image') {
      const caption = child.attrs?.caption ? null : captionText(children[i + 1])
      if (caption) {
        next.push({ ...child, attrs: { ...(child.attrs ?? {}), caption } })
        i++
        continue
      }
      next.push(child)
      continue
    }
    next.push(attachLegacyCaptions(child))
  }
  return { ...node, content: next }
}
