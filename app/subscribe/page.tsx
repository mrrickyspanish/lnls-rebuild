import Link from 'next/link'

import NewsletterSignup from '@/components/NewsletterSignup'
import { SITE_OWNER } from '@/lib/author'

export const metadata = {
  title: 'Subscribe',
  description: 'Sports, tech, culture, and life at home, by email. Pick the lanes you want.',
}

/**
 * Same layout family as Contact and About. The sign-up box is the shared one
 * (components/NewsletterSignup.tsx), with lane picks, so this page and the
 * footer can't drift apart; the footer copy hides itself here.
 *
 * The podcast block used to be four placeholder buttons (Apple, Spotify,
 * Google, YouTube) that all linked to "#", and Google Podcasts no longer
 * exists. It now links to the podcast page, which has the real feed.
 */
export default function SubscribePage() {
  return (
    <div className="tdd-home tdd-contact">
      <header className="tdd-contact-hero">
        <h1>Subscribe</h1>
        <p>
          Never miss a dribble... new pieces from me, {SITE_OWNER.name}, straight to your inbox. Unfiltered and to the point.
        </p>
      </header>

      <NewsletterSignup variant="page" />

      <section className="tdd-contact-section" aria-labelledby="subscribe-podcast">
        <h2 id="subscribe-podcast">Late Night Lake Show</h2>
        <p>Lakers talk, uncut.</p>
        <p><Link href="/podcast">Listen on the podcast page</Link></p>
      </section>
    </div>
  )
}
