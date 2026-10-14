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
/**
 * Every topic an article can have: the ONE list. The admin editor's dropdown,
 * the /news filter and the footer's topic links all read it.
 *
 * They used to be three separate lists that disagreed. /news accepted `Tech`
 * and `Culture`, which no article can be given, so the footer's "Tech & Culture"
 * and "Sports Culture" links always came back empty, while Football, Analysis
 * and Rumors were silently ignored by the filter (the page just showed
 * everything). Add a topic here and it appears everywhere.
 *
 * FEATURED is an editorial flag kept as a topic by the editor, so it is valid
 * but is not offered as a public link.
 *
 * "Rumors" was retired as a topic: Rumor is now a label
 * (lib/articles/piece-type.ts), so a rumor about the Lakers files under
 * Lakers. Older stories may still carry it; the editor keeps it selectable
 * for them until a new topic is picked.
 */
export const ARTICLE_TOPICS = [
  'FEATURED',
  'Recruit Ready',
  'Lakers',
  'NBA',
  'Football',
  'Analysis',
  'Tech',
  'Lifestyle',
  'Home',
] as const

export type ArticleTopic = (typeof ARTICLE_TOPICS)[number]

/** Topics offered as public links, in display order. */
export const PUBLIC_TOPICS: readonly ArticleTopic[] = ['Lakers', 'NBA', 'Football', 'Recruit Ready', 'Analysis', 'Tech', 'Lifestyle', 'Home']

export function isArticleTopic(value: string | null | undefined): value is ArticleTopic {
  return (ARTICLE_TOPICS as readonly string[]).includes(value ?? '')
}

export type TopicFamily = 'games' | 'analysis' | 'culture' | 'home'

const FAMILY_BY_TOPIC: Record<string, TopicFamily> = {
  // On the field and on the court.
  lakers: 'games',
  nba: 'games',
  football: 'games',
  'recruit ready': 'games',
  // The numbers and the reporting behind the result.
  analysis: 'analysis',
  rumors: 'analysis', // retired topic, still on older stories
  tech: 'analysis',
  // Everything around the game.
  lifestyle: 'culture',
  featured: 'culture',
  // Marriage, fatherhood, life at home.
  home: 'home',
}

export function topicFamily(topic?: string | null): TopicFamily {
  if (!topic) return 'games'
  return FAMILY_BY_TOPIC[topic.trim().toLowerCase()] ?? 'games'
}

/** Podcast and video shelves are not topic-tagged, so they get fixed families. */
export const PODCAST_FAMILY: TopicFamily = 'culture'
export const VIDEO_FAMILY: TopicFamily = 'analysis'

/**
 * The four lanes readers see (About page, home page filters, subscribe
 * form). Each lane is one topic family, so a story's lane always follows
 * its topic: Court = games, Code = analysis, Culture = culture, Home = home.
 * `key` is what a subscriber's lane picks are stored as.
 */
export const LANES = [
  { key: 'court', label: 'Court', family: 'games' },
  { key: 'code', label: 'Code', family: 'analysis' },
  { key: 'culture', label: 'Culture', family: 'culture' },
  { key: 'home', label: 'Home', family: 'home' },
] as const satisfies ReadonlyArray<{ key: string; label: string; family: TopicFamily }>

export type LaneKey = (typeof LANES)[number]['key']

export function isLaneKey(value: unknown): value is LaneKey {
  return LANES.some((lane) => lane.key === value)
}

export function laneForTopic(topic?: string | null) {
  const family = topicFamily(topic)
  return LANES.find((lane) => lane.family === family) ?? LANES[0]
}

/**
 * Whether a subscriber should get a story's email: yes if they never
 * narrowed their lanes (NULL or empty = every lane), or if they picked the
 * story's lane.
 */
export function wantsStory(subscriberLanes: string[] | null | undefined, topic?: string | null) {
  return !subscriberLanes?.length || subscriberLanes.includes(laneForTopic(topic).key)
}
