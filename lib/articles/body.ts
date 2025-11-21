import type { ArticleBodyBlock } from '@/types/supabase'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
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

export function normalizeArticleBody(value: unknown): ArticleBodyBlock[] {
  const maybeParsed = typeof value === 'string' ? tryParseBody(value) : value
  if (isArticleBodyBlocks(maybeParsed)) {
    return maybeParsed
  }
  return []
}

function tryParseBody(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('Failed to parse article body JSON string', error)
    return null
  }
}
