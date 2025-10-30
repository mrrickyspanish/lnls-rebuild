import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-base/95 backdrop-blur-sm border-b border-slate-muted/20">
      <nav className="section-container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bebas gradient-text tracking-wider">
              LNLS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/news"
              className="text-offwhite hover:text-neon-purple transition-colors font-medium"
            >
              News
            </Link>
            <Link
              href="/podcast"
              className="text-offwhite hover:text-neon-purple transition-colors font-medium"
            >
              Podcast
            </Link>
            <Link
              href="/videos"
              className="text-offwhite hover:text-neon-purple transition-colors font-medium"
            >
              Videos
            </Link>
            <Link
              href="/about"
              className="text-offwhite hover:text-neon-purple transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/subscribe"
              className="btn-primary text-sm"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-offwhite">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </header>
  )
}
