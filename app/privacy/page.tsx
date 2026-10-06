import Link from 'next/link'

import LegalDoc from '@/components/LegalDoc'
import { CONTACT_EMAIL } from '@/lib/contact'

export const metadata = {
  title: 'Privacy Policy',
  description: 'What The Daily Dribble collects when you read, subscribe or write for us, why, and the choices you have.',
}

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated="October 6, 2026">
      <p>
        The Daily Dribble is a sports, tech, and culture publication with a newsletter, a podcast, and
        videos. This page explains what information we collect when you use thedailydribble.com, why we
        collect it, and the choices you have. We collect as little as we can.
      </p>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Your email address</strong>, if you subscribe to the newsletter. We also record when
            you subscribed and whether you are still subscribed.
          </li>
          <li>
            <strong>Messages you send us.</strong> If you email {CONTACT_EMAIL}, we keep your message and
            your address so we can reply.
          </li>
          <li>
            <strong>Reading activity.</strong> When you open an article, your browser tells us which
            article it was so we can add one to its view count. When you like an article, we add one to
            its like count. These counts are not tied to your name or email address.
          </li>
          <li>
            <strong>Basic traffic data.</strong> We use Vercel Web Analytics to see which pages are
            visited, where visitors come from, and general browser, device, and country information. It
            does not use cookies to follow you across other sites.
          </li>
          <li>
            <strong>Server logs.</strong> Our hosting provider, Vercel, keeps standard logs of requests
            to the site. These can include your IP address and browser details, and we use them for
            security and to keep the site running.
          </li>
          <li>
            <strong>Staff accounts.</strong> If you are a writer with an account, we store your name, your
            email address, and a password that our sign-in provider keeps in encrypted form.
          </li>
        </ul>
      </section>

      <section>
        <h2>What stays in your browser</h2>
        <p>
          The site saves two small things in your browser’s local storage: which articles you have liked,
          and when you last viewed an article, so that refreshing the page does not count as a new view.
          You can clear both at any time in your browser settings.
        </p>
        <p>
          We do not use advertising or tracking cookies. If you sign in to the staff area, we set cookies
          that keep you signed in.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To send you the newsletter and a short welcome note when you subscribe.</li>
          <li>To reply when you write to us.</li>
          <li>To understand which stories people read, so we can cover what matters.</li>
          <li>To keep the site secure and working, and to run the staff area.</li>
        </ul>
        <p>We do not use your information for advertising, and we do not build profiles of readers.</p>
      </section>

      <section>
        <h2>Who else handles it</h2>
        <p>We use a small number of service providers to run the site:</p>
        <ul>
          <li><strong>Vercel</strong> hosts the site and provides our analytics.</li>
          <li><strong>Supabase</strong> stores our database, including newsletter addresses and staff sign-in.</li>
          <li><strong>Resend</strong> sends our email.</li>
          <li>
            <strong>Upstash</strong> runs the queue that sends a newsletter. It is told which article to
            send, not who is subscribed.
          </li>
        </ul>
        <p>
          We do not sell your personal information, and we do not give your email address to advertisers
          or data brokers. We may disclose information if the law requires it, or to protect the site and
          its readers.
        </p>
      </section>

      <section>
        <h2>Content from other sites</h2>
        <p>
          Some articles embed videos from YouTube and posts from X, and our podcast audio and some images
          are served by other services, such as Spreaker. When your browser loads that content, those
          companies can see your IP address and device details and may set their own cookies, under their
          own privacy policies.
        </p>
      </section>

      <section>
        <h2>Email and unsubscribing</h2>
        <p>
          Every newsletter has an unsubscribe link. When you use it, we stop emailing you and keep your
          address on a do-not-email list so you are not added again by accident. If you want the address
          deleted completely, email us and we will remove it.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep your newsletter address while you are subscribed, and afterward only on the do-not-email
          list described above. We keep messages you send us for as long as we need to answer and follow
          up. View and like counts are anonymous totals and stay with the article. Our hosting and
          analytics providers keep their own logs for the periods set in their policies.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          Depending on where you live, you may have the right to ask what information we hold about you,
          to have it corrected or deleted, and to object to how we use it. Email {CONTACT_EMAIL} and we
          will respond. We may ask you to confirm that the request is really from you.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          We use reputable providers and encrypted connections. No method of sending or storing data is
          completely secure, so we cannot promise absolute security.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The Daily Dribble is not directed to children under 13, and we do not knowingly collect their
          information. If you believe a child has given us theirs, email us and we will delete it.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we change this policy, we will post the new version on this page with a new date. If the
          change is significant, we will say so prominently on the site.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy or your information: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          Our rules for using the site are in the <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalDoc>
  )
}
