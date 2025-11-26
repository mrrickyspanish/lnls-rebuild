import type { ArticleBody, ArticleBodyBlock, TipTapDocNode } from '@/types/supabase'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isTipTapDoc(value: unknown): value is TipTapDocNode {
  if (!isRecord(value)) return false
  if (typeof value.type !== 'string') return false
  if (value.type !== 'doc') return false
  if ('content' in value && value.content !== undefined && !Array.isArray(value.content)) {
    return false
  }
  return true
}

export function isArticleBodyBlock(value: unknown): value is ArticleBodyBlock {
  if (!isRecord(value) || typeof value.type !== 'string') return false
  if (value.type === 'paragraph') {
    return typeof value.text === 'string' && value.text.trim().length > 0
  }
  if (value.type === 'heading') {
    const hasText = typeof value.text === 'string' && value.text.trim().length > 0
    if (!hasText) return false
    if (value.level === undefined) return true
    return typeof value.level === 'number' && value.level >= 1 && value.level <= 4
  }
  return false
}

export function isArticleBodyBlocks(value: unknown): value is ArticleBodyBlock[] {
  return Array.isArray(value) && value.every(isArticleBodyBlock)
}

export function isRichTextContent(value: unknown): value is ArticleBody {
  return isArticleBodyBlocks(value) || isTipTapDoc(value)
}

export function normalizeArticleBody(value: unknown): ArticleBody {
  const maybeParsed = typeof value === 'string' ? tryParseBody(value) : value
  if (isArticleBodyBlocks(maybeParsed)) {
    return maybeParsed
  }
  if (isTipTapDoc(maybeParsed)) {
    return maybeParsed
  }
  return []
}

export function blocksToTipTapDoc(blocks: ArticleBodyBlock[]): TipTapDocNode {
  return {
    type: 'doc',
    content: blocks.map((block) => {
      if (block.type === 'heading') {
        return {
          type: 'heading',
          attrs: { level: block.level || 2 },
          content: [
            {
              type: 'text',
              text: block.text,
            },
          ],
        }
      }

      return {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: block.text,
          },
        ],
      }
    }),
  }
}

function tryParseBody(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('Failed to parse article body JSON string', error)
    return null
  }
}
