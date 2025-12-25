"use client";

import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/news', label: 'News' },
  { href: '/podcast', label: 'Podcasts' },
  { href: '/videos', label: 'Videos' },
  { href: '/about', label: 'About' },
];

  const topicPills = [
    { label: 'Lakers', active: true },
    { label: 'Trade Rumors', active: false },
    { label: 'Playoffs', active: false },
    { label: 'Draft', active: false },
  ];

  export default function Header() {
    return (
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
          <button className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded transition absolute left-3 md:left-6 top-1/2 -translate-y-1/2 group focus:outline-none" aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="7" width="24" height="4" rx="2" fill="#111" className="transition group-hover:fill-[var(--neon-purple,#a259f7)]" />
              <rect y="14" width="24" height="4" rx="2" fill="#111" className="transition group-hover:fill-[var(--neon-purple,#a259f7)]" />
              <rect y="21" width="24" height="4" rx="2" fill="#111" className="transition group-hover:fill-[var(--neon-purple,#a259f7)]" />
            </svg>
          </button>
          {/* Topic Pills (left of center) */}
          <div className="flex-1 flex items-center gap-2 md:gap-3 ml-12 md:ml-20">
            {topicPills.slice(0, 2).map((pill) => (
              <span
                key={pill.label}
                className={clsx(
                  'hidden md:inline-block rounded-full px-3 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-semibold transition-all',
                  pill.active
                    ? 'bg-[var(--neon-orange,#FD6B0B)] text-white shadow-md scale-105'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-[var(--neon-orange,#FD6B0B)] hover:text-white hover:shadow'
                )}
                style={!pill.active ? { transition: 'background 0.2s, color 0.2s' } : {}}
              >
                {pill.label}
              </span>
            ))}
          </div>
          {/* Centered Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 select-none">
            <span className="text-4xl md:text-6xl font-extrabold tracking-tighter text-black leading-none drop-shadow-lg" style={{letterSpacing: '-0.04em'}}>itsDribbles</span>
            <span className="flex gap-[2px] ml-1 md:ml-1.5" style={{ position: 'relative', top: '1.1em' }}>
              <motion.span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: 'var(--neon-orange, #FD6B0B)', boxShadow: '0 0 4px var(--neon-orange, #FD6B0B)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: 'var(--neon-blue, #00e6fe)', boxShadow: '0 0 4px var(--neon-blue, #00e6fe)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.18 }}
              />
              <motion.span
                className="w-2 h-2 rounded-full inline-block"
                style={{ background: 'var(--neon-purple, #a259f7)', boxShadow: '0 0 4px var(--neon-purple, #a259f7)' }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.36 }}
              />
            </span>
          </Link>
          {/* Topic Pills (right of center) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-3 mr-12 md:mr-20">
            {topicPills.slice(2).map((pill) => (
              <span
                key={pill.label}
                className={clsx(
                  'hidden md:inline-block rounded-full px-3 md:px-4 py-0.5 md:py-1 text-xs md:text-sm font-semibold transition-all',
                  pill.active
                    ? 'bg-[var(--neon-orange,#FD6B0B)] text-white shadow-md scale-105'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-[var(--neon-orange,#FD6B0B)] hover:text-white hover:shadow'
                )}
                style={!pill.active ? { transition: 'background 0.2s, color 0.2s' } : {}}
              >
                {pill.label}
              </span>
            ))}
          </div>
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
    );
}
