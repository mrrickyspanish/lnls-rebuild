"use client";

import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPodcastDropdownOpen, setIsPodcastDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#141414]' 
        : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="flex items-center gap-12 px-12 h-[68px]">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bebas gradient-text tracking-wider">
            LNLS
          </span>
        </Link>

        {/* Nav Links - Left aligned after logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/news"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors relative group"
          >
            News
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
          </Link>
          
          {/* Podcast Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsPodcastDropdownOpen(true)}
            onMouseLeave={() => setIsPodcastDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium transition-colors relative group">
              Podcast
              <ChevronDown className={`w-3 h-3 transition-transform ${isPodcastDropdownOpen ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
            </button>
            
            {/* Dropdown Menu */}
            {isPodcastDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-[#141414] border border-white/10 rounded-lg shadow-2xl min-w-[200px] py-2 z-50">
                <Link
                  href="/podcast"
                  className="block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  All Episodes
                </Link>
                <Link
                  href="/podcast/sample-episode-1"
                  className="block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  Sample Episode 1
                </Link>
                <Link
                  href="/podcast/sample-episode-2"
                  className="block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  Sample Episode 2
                </Link>
                <Link
                  href="/podcast/latest-lakers-talk"
                  className="block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 text-sm transition-colors"
                >
                  Latest Lakers Talk
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/videos"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors relative group"
          >
            Videos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/about"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/news/sample-lakers-article"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors relative group"
          >
            Sample Article
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Subscribe Button */}
        <div className="hidden md:block">
          <Link
            href="/subscribe"
            className="px-6 py-2 bg-[var(--netflix-red)] hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
          >
            Subscribe
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}
