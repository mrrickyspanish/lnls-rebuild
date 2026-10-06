import Link from 'next/link'

import LegalDoc from '@/components/LegalDoc'
import { CONTACT_EMAIL } from '@/lib/contact'

export const metadata = {
  title: 'Terms of Service',
  description: 'The rules for using thedailydribble.com, our newsletter, and our podcast and video content.',
}

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="October 6, 2026">
      <p>
        These terms apply to your use of thedailydribble.com, our newsletter, and our podcast and video
        content (together, the “Site”). By using the Site you agree to them. If you do not agree, please
        do not use it.
      </p>

      <section>
        <h2>Who we are</h2>
        <p>
          The Daily Dribble (“we”, “us”) publishes sports, tech, and culture coverage. You can reach us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>Using the Site</h2>
        <p>You may read, share links to, and talk about our content for personal, non-commercial use. Please do not:</p>
        <ul>
          <li>break the law or help anyone else break it;</li>
          <li>
            try to get into parts of the Site or its systems that you are not authorized to use, including
            the staff area and our APIs;
          </li>
          <li>interfere with the Site or overload it, including with automated scraping that burdens our servers;</li>
          <li>sign up an email address that is not yours for the newsletter.</li>
        </ul>
      </section>

      <section>
        <h2>Our content</h2>
        <p>
          The articles, graphics, logos, original photos, podcast episodes, and videos we produce are
          protected by copyright and belong to us or to the people who made them. You may quote short
          excerpts with credit and a link back to the original. Please do not republish whole articles, or
          our art and audio, without written permission.
        </p>
      </section>

      <section>
        <h2>Other people’s content and trademarks</h2>
        <p>
          The Site includes content from other sources, such as embedded YouTube videos, posts from X, and
          podcast hosting. That content belongs to its owners and is governed by their terms.
        </p>
        <p>
          NBA, team, league, player, and brand names and logos are trademarks of their owners. The Daily
          Dribble is an independent media outlet and is not affiliated with, endorsed by, or sponsored by
          the NBA or any team, league, or player.
        </p>
      </section>

      <section>
        <h2>The newsletter</h2>
        <p>
          If you subscribe, you agree to receive our emails. You can unsubscribe at any time with the link
          in any email. How we handle your address is explained in the{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Staff accounts</h2>
        <p>
          Staff accounts are for people we have authorized to write or manage content. Keep your sign-in
          details private. You are responsible for activity under your account, and we may suspend or
          remove access at any time. What a writer submits is governed by the agreement between that
          writer and The Daily Dribble.
        </p>
      </section>

      <section>
        <h2>Opinions and accuracy</h2>
        <p>
          Our coverage includes opinion and analysis, which reflect the views of the writer. We work to be
          accurate, but sports news moves quickly, and we may get things wrong or miss an update. Nothing
          on the Site is financial, legal, or betting advice.
        </p>
      </section>

      <section>
        <h2>Copyright complaints</h2>
        <p>
          If you believe something on the Site infringes your copyright, email {CONTACT_EMAIL} with what
          you believe is infringing and where it appears, how to reach you, and a statement that you own
          the work or are authorized to act for the owner. We will review it and remove material where
          that is appropriate.
        </p>
      </section>

      <section>
        <h2>No warranties</h2>
        <p>
          To the extent the law allows, the Site is provided “as is” and “as available”, without
          warranties of any kind. We do not promise that it will be uninterrupted, error free, or secure.
        </p>
      </section>

      <section>
        <h2>Limits on our liability</h2>
        <p>
          To the extent the law allows, The Daily Dribble and the people who write for it are not liable
          for indirect, incidental, or consequential damages, or for any loss that comes from using, or
          being unable to use, the Site. Nothing in these terms limits liability that the law does not
          allow us to limit.
        </p>
      </section>

      <section>
        <h2>Changes and ending access</h2>
        <p>
          We may change the Site or these terms. When we change the terms, we will post the new version
          here with a new date, and continuing to use the Site after that means you accept it. We may
          suspend or end access for anyone who breaks these terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalDoc>
  )
}
