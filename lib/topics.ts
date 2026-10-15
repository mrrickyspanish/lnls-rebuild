/**
 * Every story is tagged with exactly one of four buckets, and the bucket is
 * the story's topic: Court, Code, Culture or Life. It decides the story's
 * color everywhere (tags, art, the accents on its page, its share graphics),
 * the home page filter it falls under, and which subscribers get its email.
 *
 * Stories saved before buckets carry an old topic (Lakers, NBA, Tech...).
 * Those still resolve to a bucket through LEGACY_TOPICS, so nothing
 * breaks before supabase/topics_to_buckets.sql moves them over, and the
 * editor pre-selects the matching bucket when one is opened.
 */
export const ARTICLE_TOPICS = ['Court', 'Code', 'Culture', 'Life'] as const

export type ArticleTopic = (typeof ARTICLE_TOPICS)[number]

/** Shown as public links (footer, /news filter), in display order. */
export const PUBLIC_TOPICS: readonly ArticleTopic[] = ARTICLE_TOPICS

export function isArticleTopic(value: string | null | undefined): value is ArticleTopic {
  return (ARTICLE_TOPICS as readonly string[]).includes(value ?? '')
}

export type TopicFamily = 'court' | 'code' | 'culture' | 'life'

/** Old topic names, by the bucket they belong to. */
const LEGACY_TOPICS: Record<TopicFamily, string[]> = {
  court: ['Lakers', 'NBA', 'Football', 'Recruit Ready', 'Analysis', 'Rumors', 'FEATURED'],
  code: ['Tech'],
  culture: ['Lifestyle'],
  life: ['Home'],
}

const FAMILY_BY_TOPIC: Record<string, TopicFamily> = Object.fromEntries([
  ...ARTICLE_TOPICS.map((topic) => [topic.toLowerCase(), topic.toLowerCase() as TopicFamily]),
  ...Object.entries(LEGACY_TOPICS).flatMap(([family, names]) => names.map((name) => [name.toLowerCase(), family])),
])

export function topicFamily(topic?: string | null): TopicFamily {
  if (!topic) return 'court'
  return FAMILY_BY_TOPIC[topic.trim().toLowerCase()] ?? 'court'
}

/** True for a pre-bucket topic name (Lakers, NBA, Tech...). */
export function isLegacyTopic(value: string | null | undefined) {
  const v = (value ?? '').trim().toLowerCase()
  return Object.values(LEGACY_TOPICS).some((names) => names.some((name) => name.toLowerCase() === v))
}

/** The bucket name for any topic, old or new: 'Lakers' -> 'Court'. */
export function bucketFor(topic?: string | null): ArticleTopic {
  const family = topicFamily(topic)
  return ARTICLE_TOPICS.find((bucket) => bucket.toLowerCase() === family) ?? 'Court'
}

/** Every stored topic value that means this bucket, old names included. */
export function topicsInBucket(bucket: ArticleTopic): string[] {
  const family = bucket.toLowerCase() as TopicFamily
  return [bucket, ...LEGACY_TOPICS[family]]
}

/** Each bucket's color, for places CSS can't reach (share graphics). */
export const BUCKET_COLORS: Record<TopicFamily, string> = {
  court: '#FF6B35',
  code: '#00D4FF',
  culture: '#B857FF',
  life: '#3DDC97',
}

/** Podcast and video shelves are not topic-tagged, so they get fixed families. */
export const PODCAST_FAMILY: TopicFamily = 'culture'
export const VIDEO_FAMILY: TopicFamily = 'code'

/**
 * The four buckets as lanes: About page, home page filters, subscribe form.
 * `key` is what a subscriber's lane picks are stored as.
 */
export const LANES = [
  { key: 'court', label: 'Court', family: 'court' },
  { key: 'code', label: 'Code', family: 'code' },
  { key: 'culture', label: 'Culture', family: 'culture' },
  { key: 'life', label: 'Life', family: 'life' },
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
  if (!subscriberLanes?.length) return true
  // "home" was the Life lane's first name; anyone who picked it means Life.
  const picks = subscriberLanes.map((lane) => (lane === 'home' ? 'life' : lane))
  return picks.includes(laneForTopic(topic).key)
}
