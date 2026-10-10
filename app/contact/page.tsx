import Link from 'next/link'

import { SITE_OWNER, SITE_OWNER_X_URL } from '@/lib/author'
import { CONTACT_EMAIL, SOCIAL_HANDLE, SOCIALS } from '@/lib/contact'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with The Daily Dribble: story tips, feedback, or just to say hey.',
}

export default function ContactPage() {
  return (
    <div className="tdd-home tdd-contact">
      <header className="tdd-contact-hero">
        <h1>Contact</h1>
        <p>Got a story tip, feedback, or just want to say hey? It comes straight to me.</p>
      </header>

      <section className="tdd-contact-section" aria-labelledby="contact-email">
        <h2 id="contact-email">Email</h2>
        <a className="tdd-contact-email" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        <p>
          Spotted a mistake in a story? Email me and I&apos;ll fix it. <Link href="/standards#corrections">How corrections work</Link>
        </p>
      </section>

      <section className="tdd-contact-section" aria-labelledby="contact-social">
        <h2 id="contact-social">Social</h2>
        <p>
          The Daily Dribble is @{SOCIAL_HANDLE} on every platform, and my DMs are open. Personally, I&apos;m{' '}
          <a href={SITE_OWNER_X_URL} target="_blank" rel="noopener noreferrer">{SITE_OWNER.twitter}</a> on X.
        </p>
        <ul className="tdd-contact-socials">
          {SOCIALS.map(social => (
            <li key={social.label}>
              <a href={social.url} target="_blank" rel="noopener noreferrer">
                <span>{social.label}</span>
                <span>@{SOCIAL_HANDLE}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
