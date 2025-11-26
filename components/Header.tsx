import Link from 'next/link'
import { Search } from 'lucide-react'
import AnimatedLogo from '@/components/AnimatedLogo'

const navLinks = [
  { href: '/news', label: 'News' },
  { href: '/podcast', label: 'Podcasts' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  return (
    <header className="hidden lg:block sticky top-0 z-50 border-b border-white/10 bg-[#050505]/95 backdrop-blur supports-[backdrop-filter]:bg-[#050505]/80">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between text-white">
        <AnimatedLogo className="text-3xl" />

        <nav className="flex items-center text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
          {navLinks.map((link, index) => (
            <div key={link.href} className="flex items-center">
              <Link
                href={link.href}
                className="px-4 py-2 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
              {index < navLinks.length - 1 && <span className="text-white/30">/</span>}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60 hover:text-white transition-colors"
          >
            SIGN IN
          </Link>
          <Link
            href="/subscribe"
            className="px-6 py-2 bg-[var(--netflix-red)] text-white text-xs font-bold uppercase tracking-[0.35em] rounded-full hover:bg-red-700 transition-colors"
          >
            SUBSCRIBE
          </Link>
        </div>
      </div>
    </header>
  )
}
