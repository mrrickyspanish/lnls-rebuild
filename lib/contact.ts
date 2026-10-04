/**
 * How to reach The Daily Dribble. One definition, used by the contact page,
 * the footer and the Twitter/X card metadata, so they cannot drift apart.
 *
 * The contact page previously listed contact@latenight.com and @lnlssports,
 * the footer linked a third handle (thedailydribble), and the share metadata a
 * fourth (@dailydribble).
 */
export const CONTACT_EMAIL = 'contact@thedailydribble.com'

/** The same handle on every platform. */
export const SOCIAL_HANDLE = 'itsdribbles'

export const SOCIAL_URLS = {
  x: `https://x.com/${SOCIAL_HANDLE}`,
  instagram: `https://instagram.com/${SOCIAL_HANDLE}`,
  youtube: `https://youtube.com/@${SOCIAL_HANDLE}`,
  facebook: `https://facebook.com/${SOCIAL_HANDLE}`,
} as const

export const SOCIALS = [
  { label: 'X', url: SOCIAL_URLS.x },
  { label: 'Instagram', url: SOCIAL_URLS.instagram },
  { label: 'YouTube', url: SOCIAL_URLS.youtube },
  { label: 'Facebook', url: SOCIAL_URLS.facebook },
] as const
