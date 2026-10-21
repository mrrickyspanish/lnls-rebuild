import { SITE_OWNER } from '@/lib/author'

export const TAGLINE = `Sports, tech, culture, and life at home, from the mind of ${SITE_OWNER.name}`
const SHORT_TAGLINE = `From the mind of ${SITE_OWNER.name}`

/**
 * The site tagline, always on one line. Where the full line fits at the
 * surrounding text size it shows in full; where it doesn't (phones, narrow
 * columns) the short byline shows instead. The switch is a container query
 * on the space the tagline actually has (globals.css, .tdd-tagline), so it
 * holds in any spot: the home dateline, About, the footer.
 */
export default function Tagline() {
  return (
    <span className="tdd-tagline">
      <span className="tdd-tagline-full">{TAGLINE}</span>
      <span className="tdd-tagline-short">{SHORT_TAGLINE}</span>
    </span>
  )
}
