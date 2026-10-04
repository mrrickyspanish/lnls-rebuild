/**
 * Topic families: the one rule that lets the front page use all three brand
 * neons without turning them into decoration.
 *
 * The wordmark is built from three colored dots, so the palette is already
 * the brand's. Here each dot is given a job: every story is sorted into one
 * of three families, and that family drives the story's tag color and the
 * duotone cast on its art. Color on the front page therefore always means
 * something. It is never applied for visual interest.
 *
 * Keys below are the real topic values the admin editor writes
 * (components/admin/ArticleForm.tsx). Add new topics here when the editor
 * gains them, otherwise they fall back to `games`.
 */
export type TopicFamily = 'games' | 'analysis' | 'culture'

const FAMILY_BY_TOPIC: Record<string, TopicFamily> = {
  // On the field and on the court.
  lakers: 'games',
  nba: 'games',
  football: 'games',
  'recruit ready': 'games',
  // The numbers and the reporting behind the result.
  analysis: 'analysis',
  rumors: 'analysis',
  // Everything around the game.
  lifestyle: 'culture',
  featured: 'culture',
}

export function topicFamily(topic?: string | null): TopicFamily {
  if (!topic) return 'games'
  return FAMILY_BY_TOPIC[topic.trim().toLowerCase()] ?? 'games'
}

/** Podcast and video shelves are not topic-tagged, so they get fixed families. */
export const PODCAST_FAMILY: TopicFamily = 'culture'
export const VIDEO_FAMILY: TopicFamily = 'analysis'
