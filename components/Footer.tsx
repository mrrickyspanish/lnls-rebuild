import Link from 'next/link'

import NewsletterSignup from './NewsletterSignup'
import { CONTACT_EMAIL, SOCIAL_HANDLE, SOCIALS } from '@/lib/contact'
import { PUBLIC_TOPICS } from '@/lib/topics'

const SECTIONS = [
  { href: '/news', label: 'News' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
]

// One writer, so there's no "Write for us": readers send tips instead.
const SEND_A_TIP = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Tip for The Daily Dribble')}`

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="tdd-footer">
      <div className="tdd-footer-news">
        <div className="tdd-footer-inner">
          <NewsletterSignup />
        </div>
      </div>

      <div className="tdd-footer-inner">
        <div className="tdd-footer-main">
          <div className="tdd-footer-brand">
            <p className="tdd-footer-wordmark">The Daily Dribble</p>
            <p>Sports, tech, and the culture around the game.</p>
          </div>

          <nav aria-label="Sections">
            <h2>Sections</h2>
            <ul className="tdd-footer-links">
              {SECTIONS.map(link => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Topics">
            <h2>Topics</h2>
            <ul className="tdd-footer-links">
              {PUBLIC_TOPICS.map(topic => (
                <li key={topic}>
                  <Link href={`/news?topic=${encodeURIComponent(topic)}`}>{topic}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Connect">
            <h2>Connect</h2>
            <ul className="tdd-footer-links">
              <li><Link href="/contact">Contact</Link></li>
              <li><a href={SEND_A_TIP}>Send a tip</a></li>
              {SOCIALS.map(social => (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (@${SOCIAL_HANDLE}), opens in a new tab`}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="tdd-footer-legal">
          <p>&copy; {currentYear} The Daily Dribble. All rights reserved.</p>
          <nav aria-label="Legal" className="tdd-footer-legal-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/standards">How I work</Link>
            <Link href="/login">Sign in</Link>
          </nav>
          <p className="tdd-footer-disclaimer">
            The Daily Dribble is an independent media outlet and is not affiliated with the NBA or any specific team.
          </p>
        </div>
      </div>
    </footer>
  )
}
