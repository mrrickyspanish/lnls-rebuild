'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedLogo from '@/components/AnimatedLogo'
import StreamTabs from '@/components/StreamTabs'
import { useTabContext } from '@/components/home/HomePageClient'

interface MenuSection {
  name: string
  color: string
  items: Array<{ label: string; href: string }>
}

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { activeTab, setActiveTab } = useTabContext()

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('menu-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }

    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black lg:hidden">
        {/* Sticky Utility Bar */}
        <div className="sticky top-0 bg-black">
          <div className="flex items-center justify-end gap-3 h-14 px-4">
            <Link
              href="/subscribe"
              className="text-black text-sm font-semibold bg-[#2FE6C8] px-3 py-2 rounded hover:opacity-90 transition-opacity"
            >
              Subscribe
            </Link>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Masthead Section */}
        <div>
          <div className="px-4">
            <AnimatedLogo size="lg" />
          </div>
        </div>

        {/* Tab Navigation */}
        <StreamTabs value={activeTab} onChange={setActiveTab} />
      </header>

      <div className="h-[150px] lg:hidden" />

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm mobile-menu-gradient z-[70] overflow-y-auto lg:hidden"
            >
              <MobileMenu onClose={() => setIsMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const sections: MenuSection[] = [
    {
      name: 'Court',
      color: 'from-orange-500 to-orange-600',
      items: [
        { label: 'Lakers', href: '/news?topic=Lakers' },
        { label: 'NBA', href: '/news?topic=NBA' },
        { label: 'Game Recaps', href: '/news?category=recaps' },
        { label: 'Analysis', href: '/news?category=analysis' },
      ],
    },
    {
      name: 'Code',
      color: 'from-blue-500 to-blue-600',
      items: [
        { label: 'Tech', href: '/news?topic=Tech' },
        { label: 'Analytics', href: '/news?category=analytics' },
        { label: 'Gaming', href: '/news?category=gaming' },
        { label: 'Gear', href: '/news?category=gear' },
      ],
    },
    {
      name: 'Culture',
      color: 'from-purple-500 to-purple-600',
      items: [
        { label: 'Culture', href: '/news?topic=Culture' },
        { label: 'Fashion', href: '/news?category=fashion' },
        { label: 'Music', href: '/news?category=music' },
        { label: 'Lifestyle', href: '/news?category=lifestyle' },
      ],
    },
  ]

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:text-[var(--netflix-red)] transition-colors" onClick={onClose}>
            Login
          </Link>
          <span className="text-white/40">/</span>
          <Link href="/signup" className="hover:text-[var(--netflix-red)] transition-colors" onClick={onClose}>
            Sign Up
          </Link>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 border-b border-white/10">
        <Link
          href="/search"
          className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link
          href="/news"
          onClick={onClose}
          className="block py-4 text-3xl font-bold hover:text-[var(--netflix-red)] transition-colors"
        >
          News
        </Link>

        <Link
          href="/podcast"
          onClick={onClose}
          className="block py-4 text-3xl font-bold hover:text-[var(--netflix-red)] transition-colors"
        >
          Podcast
        </Link>

        <Link
          href="/videos"
          onClick={onClose}
          className="block py-4 text-3xl font-bold hover:text-[var(--netflix-red)] transition-colors"
        >
          Videos
        </Link>

        {sections.map((section) => (
          <div key={section.name} className="border-t border-white/10 pt-2">
            <button
              onClick={() => toggleSection(section.name)}
              className="flex items-center justify-between w-full py-4 text-3xl font-bold hover:text-[var(--netflix-red)] transition-colors"
            >
              <span>{section.name}</span>
              <motion.div
                animate={{ rotate: expandedSection === section.name ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center text-white text-2xl font-light`}>
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
                  <div className="pl-4 pb-4 space-y-3">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="block text-lg text-white/70 hover:text-white transition-colors"
                      >
                        {item.label}
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
          className="block py-4 text-3xl font-bold hover:text-[var(--netflix-red)] transition-colors border-t border-white/10"
        >
          About
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2 text-sm text-white/40">
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white transition-colors" onClick={onClose}>
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors" onClick={onClose}>
            Terms
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors" onClick={onClose}>
            Contact
          </Link>
        </div>
        <p>© 2025 The Daily Dribble</p>
      </div>
    </div>
  )
}
