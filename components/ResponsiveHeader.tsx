import Link from 'next/link'

export default function ResponsiveHeader() {
  return <header className="editorial-header">
    <div className="editorial-header-inner"><Link href="/" className="editorial-brand" aria-label="The Daily Dribble home">The Daily<br/><span>Dribble<span className="text-[#2FE6C8]">.</span></span></Link><Link href="/subscribe" className="editorial-subscribe">Subscribe ↗</Link></div>
    <nav aria-label="Main navigation" className="editorial-nav"><Link href="/news">Articles</Link><Link href="/news?topic=Lakers">Lakers</Link><Link href="/news?topic=NBA">NBA</Link><Link href="/podcast">Podcast</Link><Link href="/videos">Videos</Link><Link href="/about">About</Link></nav>
  </header>
}
