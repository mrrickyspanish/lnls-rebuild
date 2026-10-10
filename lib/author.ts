/**
 * The Daily Dribble is one writer's site. This is that writer: the default
 * byline on every new story, the person the About page and /standards speak
 * as, and the author search engines are told about.
 *
 * Older stories keep whatever byline they were published with.
 */
export const SITE_OWNER = {
  name: 'Rick Barnes Jr.',
  twitter: '@mrrickyspanish',
  bio: 'Founder of The Daily Dribble & Creative Eye Studios. Digital creator and sports storyteller mixing hoops, culture, and life. Patiently persistent.',
  aboutPath: '/about',
} as const

export const SITE_OWNER_X_URL = `https://x.com/${SITE_OWNER.twitter.replace(/^@/, '')}`

export function isSiteOwner(name?: string | null) {
  return (name ?? '').trim().toLowerCase() === SITE_OWNER.name.toLowerCase()
}
