"use client";

import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';

const navLinks = [
  { href: '/news', label: 'News' },
  { href: '/podcast', label: 'Podcasts' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
];

  export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isMobileMenuOpen]);

    return (
      <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-neutral-200 shadow-sm">
        {/* Top Network Bar with trending hashtags */}
        <div className="w-full h-[42px] flex items-center justify-center px-6 bg-neutral-100 text-xs uppercase tracking-wide text-neutral-700 border-b border-neutral-200">
          {/* Top bar: subscribe left, centered logo, hashtags right */}
          <div className="flex w-full items-center justify-center">
            {/* Subscribe link left */}
            <div className="flex items-center flex-1 justify-start">
              <a href="/subscribe" className="hover:text-[var(--neon-orange,#FD6B0B)] transition-colors font-semibold relative" style={{paddingBottom: '2px'}}>
                Subscribe
                <span className="block w-full h-[2px] bg-[var(--neon-orange,#FD6B0B)] absolute left-0 -bottom-0.5 rounded" />
              </a>
              <span className="mx-1 text-neutral-300 hidden md:inline">|</span>
              <a href="https://twitter.com/hashtag/CFBPlayoff" target="_blank" rel="noopener" className="hover:text-[var(--neon-orange,#FD6B0B)] transition-colors hidden md:inline">#CFBPlayoff</a>
            </div>
            {/* Centered logo */}
            <div className="flex items-center justify-center flex-1">
              <Image src="/uploads/articles/creative-eye-studios_footer.png" alt="Creative Eye Studios" width={130} height={26} className="object-contain h-[26px] w-auto mx-auto" />
            </div>
            {/* Hashtags right */}
            <div className="flex items-center flex-1 justify-end">
              <a href="https://twitter.com/hashtag/AI" target="_blank" rel="noopener" className="hover:text-[var(--neon-orange,#FD6B0B)] transition-colors block md:inline">#AI</a>
              <span className="mx-1 text-neutral-300 hidden md:inline">|</span>
              <a href="https://twitter.com/hashtag/HolidayMovies" target="_blank" rel="noopener" className="hover:text-[var(--neon-orange,#FD6B0B)] transition-colors hidden md:inline">#HolidayMovies</a>
            </div>
          </div>
        </div>
        {/* Main Branding Row */}
        <div className="w-full flex items-center justify-between px-3 md:px-6 h-[60px] md:h-[90px] bg-white relative">
          {/* Hamburger (left) */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded transition absolute left-3 md:left-6 top-1/2 -translate-y-1/2 group focus:outline-none focus:ring-2 focus:ring-[var(--neon-purple,#a259f7)] focus:ring-offset-2" 
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="7" width="24" height="4" rx="2" fill="#111" className="transition group-hover:fill-[var(--neon-purple,#a259f7)]" />
              <rect y="14" width="24" height="4" rx="2" fill="#111" className="transition group-hover:fill-[var(--neon-purple,#a259f7)]" />
              <rect y="21" width="24" height="4" rx="2" fill="#111" className="transition group-hover:fill-[var(--neon-purple,#a259f7)]" />
            </svg>
          </button>
          {/* Centered Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-end gap-1 select-none">
            <span className="text-4xl md:text-6xl font-extrabold tracking-tighter text-black leading-none drop-shadow-lg" style={{letterSpacing: '-0.04em'}}>itsDribbles</span>
            <span
              className="flex gap-[1.5px] ml-0.5 md:ml-1 mb-[0.15em]"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: 'var(--neon-orange, #FD6B0B)', boxShadow: '0 0 3px var(--neon-orange, #FD6B0B)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: 'var(--neon-blue, #00e6fe)', boxShadow: '0 0 3px var(--neon-blue, #00e6fe)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.18 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: 'var(--neon-purple, #a259f7)', boxShadow: '0 0 3px var(--neon-purple, #a259f7)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.36 }}
              />
            </span>
          </Link>
          {/* Bolder Search (right) */}
          <Link href="/search" className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-neutral-200 hover:border-[var(--neon-orange,#FD6B0B)] hover:bg-neutral-100 transition absolute right-3 md:right-6 top-1/2 -translate-y-1/2 group" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" className="transition-all" strokeWidth="3.2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <circle cx="11" cy="11" r="8" fill="transparent" className="group-hover:fill-[var(--neon-orange,#FD6B0B)] transition-all" />
            </svg>
          </Link>
        </div>

        {/* Section Links Bar */}
        <nav className="w-full border-t border-neutral-200 bg-white">
          <ul className="flex items-center justify-center gap-0 py-2 md:py-3">
            {navLinks.map((link, idx) => (
              <li key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={clsx(
                    "text-black font-bold uppercase tracking-wider no-underline relative transition-colors duration-300 hover:text-[var(--neon-orange,#FD6B0B)] px-3 md:px-5 py-0.5 md:py-1 ",
                    "text-base md:text-lg",
                    link.href === '/' ? 'active' : ''
                  )}
                >
                  {link.label}
                  {link.href === '/' && (
                    <span className="absolute left-0 -bottom-2 w-full h-[2px] bg-[var(--neon-orange,#FD6B0B)] rounded" />
                  )}
                </Link>
                {idx < navLinks.length - 1 && <span className="text-neutral-300 text-lg md:text-xl font-bold px-1 md:px-2 select-none">|</span>}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 z-[70] overflow-y-auto shadow-2xl"
            >
              <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </>
    );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  interface MenuSection {
    name: string;
    color: string;
    items: Array<{ label: string; href: string }>;
  }

  const sections: MenuSection[] = [
    {
      name: 'Lakers',
      color: 'from-[var(--neon-purple,#a259f7)] to-purple-600',
      items: [
        { label: 'Latest News', href: '/news?topic=Lakers' },
        { label: 'Game Recaps', href: '/news?category=recaps' },
        { label: 'Analysis', href: '/news?category=analysis' },
        { label: 'Roster', href: '/news?category=roster' },
      ],
    },
    {
      name: 'NBA',
      color: 'from-[var(--neon-orange,#FD6B0B)] to-orange-600',
      items: [
        { label: 'League News', href: '/news?topic=NBA' },
        { label: 'Standings', href: '/news?category=standings' },
        { label: 'Trade Rumors', href: '/news?category=trades' },
        { label: 'Draft', href: '/news?category=draft' },
      ],
    },
    {
      name: 'Culture',
      color: 'from-[var(--neon-blue,#00e6fe)] to-blue-600',
      items: [
        { label: 'Tech', href: '/news?topic=Tech' },
        { label: 'Fashion', href: '/news?category=fashion' },
        { label: 'Lifestyle', href: '/news?category=lifestyle' },
        { label: 'Music', href: '/news?category=music' },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/subscribe" className="text-[var(--neon-orange,#FD6B0B)] hover:text-white transition-colors" onClick={onClose}>
            Subscribe
          </Link>
          <span className="text-white/40">|</span>
          <Link href="/contact" className="hover:text-[var(--neon-orange,#FD6B0B)] transition-colors" onClick={onClose}>
            Contact
          </Link>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-white/10">
        <Link
          href="/search"
          className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 hover:border-[var(--neon-orange,#FD6B0B)] transition-all"
          onClick={onClose}
        >
          <SearchIcon className="w-5 h-5" />
          <span>Search articles, podcasts & videos</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        <Link
          href="/news"
          onClick={onClose}
          className="block py-4 text-3xl font-extrabold hover:text-[var(--neon-orange,#FD6B0B)] transition-colors tracking-tight"
        >
          News
        </Link>

        <Link
          href="/podcast"
          onClick={onClose}
          className="block py-4 text-3xl font-extrabold hover:text-[var(--neon-orange,#FD6B0B)] transition-colors tracking-tight"
        >
          Podcast
        </Link>

        <Link
          href="/videos"
          onClick={onClose}
          className="block py-4 text-3xl font-extrabold hover:text-[var(--neon-orange,#FD6B0B)] transition-colors tracking-tight"
        >
          Videos
        </Link>

        {sections.map((section) => (
          <div key={section.name} className="border-t border-white/10 pt-2">
            <button
              onClick={() => toggleSection(section.name)}
              className="flex items-center justify-between w-full py-4 text-3xl font-extrabold hover:text-[var(--neon-orange,#FD6B0B)] transition-colors tracking-tight"
              aria-expanded={expandedSection === section.name}
            >
              <span>{section.name}</span>
              <motion.div
                animate={{ rotate: expandedSection === section.name ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center text-white text-2xl font-light shadow-lg`}>
                  +
                </div>
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === section.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 pb-4 space-y-3">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="block text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all"
                      >
                        → {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <Link
          href="/about"
          onClick={onClose}
          className="block py-4 text-3xl font-extrabold hover:text-[var(--neon-orange,#FD6B0B)] transition-colors border-t border-white/10 tracking-tight"
        >
          About
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/10 space-y-3 text-sm text-white/40">
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors" onClick={onClose}>
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors" onClick={onClose}>
            Terms
          </Link>
        </div>
        <p>© {new Date().getFullYear()} The Daily Dribble</p>
        <p className="text-xs">Court. Code. Culture.</p>
      </div>
    </div>
  );
}
