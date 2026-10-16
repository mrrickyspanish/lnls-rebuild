import { askClaude } from '@/lib/ai/claude'
import { canonicalizeTags, normalizeTags, tagAppearsIn } from '@/lib/articles/tags'

interface TagSource {
  title: string
  excerpt?: string | null
  text: string
  /** Tags already used on the site, so the same subject keeps one tag. */
  vocabulary?: string[]
}

/**
 * Suggests 3-6 tags for a story: who and what it's about. Every tag must
 * appear in the story's own words (title, summary or body), so a tag is
 * never invented; anything else is dropped. Returns [] if the AI call fails,
 * so a save never fails because tagging did.
 */
export async function generateTags({ title, excerpt, text, vocabulary = [] }: TagSource): Promise<string[]> {
  const source = [title, excerpt ?? '', text].join('\n\n')
  if (!source.trim()) return []
  try {
    const reply = await askClaude(
      `List the 3 to 6 most useful tags for this story, so a reader can find every story about the same thing.

Rules:
- Tags are the specific people, teams, leagues, events, places, products or companies the story is mainly about. Examples: Lakers, LeBron James, NBA Draft, Trade Deadline, Apple, Fatherhood.
- Use each name exactly as it is spelled in the story, in normal capitalization. Full names for people.
- Only use names and phrases that actually appear in the story. Never add one that isn't in the text.
- No generic words (sports, news, opinion, article, basketball fans).
${vocabulary.length ? `- Tags already used on the site are listed below. When the story is about one of them, use that exact tag (same spelling and capitalization) instead of a variation. Only reuse one if the story is actually about it.
Existing tags: ${vocabulary.slice(0, 200).join(', ')}
` : ''}- Reply with only a JSON array of strings, nothing else. Example: ["Lakers", "LeBron James", "Trade Deadline"]

Story:
"""
${source.slice(0, 12000)}
"""`,
      { maxTokens: 2000, effort: 'low' }
    )
    const match = reply.match(/\[[\s\S]*\]/)
    if (!match) return []
    const tags = normalizeTags(JSON.parse(match[0])).filter((tag) => tagAppearsIn(tag, source))
    return canonicalizeTags(tags, vocabulary).slice(0, 6)
  } catch (error) {
    console.error('Tag generation failed; saving without tags.', error)
    return []
  }
}
