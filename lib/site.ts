/**
 * The site's public origin, in one place.
 *
 * The production domain is https://thedailydribble.com. This used to be
 * re-derived in ten places with a different fallback each time, and most of
 * them fell back to https://lnls.media, so whenever NEXT_PUBLIC_SITE_URL was
 * unset the canonical URL, sitemap, share cards, the article links and
 * unsubscribe links in newsletter emails, and the QStash callback URL for
 * sending a newsletter all pointed at a domain that is not this site.
 *
 * Set NEXT_PUBLIC_SITE_URL in Vercel only to override this (for example on a
 * preview). Never include a trailing slash; one is stripped if present.
 */
export const DEFAULT_SITE_URL = 'https://thedailydribble.com'

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    DEFAULT_SITE_URL
  return raw.replace(/\/+$/, '')
}
