/**
 * Story tags: the people, teams, events and products a story is about,
 * shown as #hashtags at the end of it and used by search.
 *
 * Stored as written ("LeBron James"); shown as a hashtag (#LeBronJames).
 */
export const MAX_TAGS = 8
const MAX_TAG_LENGTH = 40

/** Trim, drop a leading #, collapse spaces, de-duplicate (case-insensitive), cap the count. */
export function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of input) {
    if (typeof raw !== 'string') continue
    const tag = raw.replace(/^#+/, '').replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LENGTH).trim()
    if (!tag || seen.has(tag.toLowerCase())) continue
    seen.add(tag.toLowerCase())
    out.push(tag)
    if (out.length === MAX_TAGS) break
  }
  return out
}

/** "LeBron James" -> "#LeBronJames". */
export function hashtag(tag: string) {
  return '#' + tag.replace(/[^\p{L}\p{N}]+/gu, '')
}

function squash(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/** True when the tag's words appear in the text, so a tag is never made up. */
export function tagAppearsIn(tag: string, text: string) {
  const needle = squash(tag)
  return needle.length > 0 && ` ${squash(text)} `.includes(` ${needle} `)
}

/**
 * Snap tags to the spelling already used on the site, case-insensitively:
 * "lakers" becomes "Lakers" if "Lakers" exists, so one subject never ends
 * up split across two tag pages.
 */
export function canonicalizeTags(tags: string[], vocabulary: string[]): string[] {
  const known = new Map(vocabulary.map((tag) => [tag.toLowerCase(), tag]))
  return normalizeTags(tags.map((tag) => known.get(tag.toLowerCase()) ?? tag))
}
