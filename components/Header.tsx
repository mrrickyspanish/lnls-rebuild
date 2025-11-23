import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tighter font-display">TDD</span>
            <span className="text-primary animate-dots">...</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/news" className="text-sm font-medium hover:text-primary transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.4)]">News</Link>
            <Link href="/podcast" className="text-sm font-medium hover:text-primary transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.4)]">Podcasts</Link>
            <Link href="/videos" className="text-sm font-medium hover:text-primary transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.4)]">Videos</Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-all hover:shadow-[0_0_10px_rgba(255,107,53,0.4)]">About</Link>
          </nav>

          <Link href="/subscribe" className="px-5 py-2 bg-primary text-black font-semibold rounded-full hover:shadow-[var(--glow-orange)] hover:-translate-y-0.5 transition-all">
            Subscribe
          </Link>
        </div>
      </div>
    </header>
  )
}
