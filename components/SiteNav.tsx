'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Search } from 'lucide-react'

/**
 * The masthead. Replaces the previous 8-line stub, which rendered only the
 * wordmark and a Subscribe button and left the site with no navigation at all.
 *
 * Sticky rather than fixed, so it stays in normal flow and no page has to
 * reserve space for it with top padding.
 */

const LINKS = [
  { href: '/news', label: 'News' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the panel on navigation, so a tap that changes page never leaves it open.
  useEffect(() => { setOpen(false) }, [pathname])

  // Escape closes the panel, matching the expected disclosure behavior.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="tdd-nav">
      <div className="tdd-nav-bar">
        <Link href="/" className="tdd-wordmark" aria-label="The Daily Dribble, home">
          <span className="tdd-wordmark-the">The Daily</span>
          <span className="tdd-wordmark-main">
            Dribble
            <span className="tdd-dots" aria-hidden="true">
              <i data-family="games" />
              <i data-family="analysis" />
              <i data-family="culture" />
            </span>
          </span>
        </Link>

        <nav className="tdd-nav-links" aria-label="Sections">
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={isActive(link.href) ? 'is-active' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="tdd-nav-actions">
          <Link href="/search" className="tdd-nav-icon" aria-label="Search">
            <Search size={19} strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link href="/subscribe" className="tdd-subscribe">Subscribe</Link>
          <button
            type="button"
            className="tdd-nav-icon tdd-nav-toggle"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            aria-controls="tdd-nav-panel"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open
              ? <X size={22} strokeWidth={2} aria-hidden="true" />
              : <Menu size={22} strokeWidth={2} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="tdd-nav-panel" id="tdd-nav-panel">
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={isActive(link.href) ? 'is-active' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/search">Search</Link>
        </div>
      )}
    </header>
  )
}
