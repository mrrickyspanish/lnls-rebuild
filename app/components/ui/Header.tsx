'use client'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Late Night Lake Show
        </Link>
        <ul className="flex gap-6 text-sm font-medium text-gray-300">
          <li><Link href="/videos" className="hover:text-white transition">Videos</Link></li>
          <li><Link href="/podcast" className="hover:text-white transition">Podcast</Link></li>
          <li><Link href="/articles" className="hover:text-white transition">Articles</Link></li>
        </ul>
      </nav>
    </header>
  )
}