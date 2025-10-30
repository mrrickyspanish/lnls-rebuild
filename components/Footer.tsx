import Link from 'next/link'
import { Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-secondary border-t border-slate-muted/20 mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bebas gradient-text mb-4">LNLS</h3>
            <p className="text-slate-muted text-sm">
              Where Lakers fans stay up talking ball.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bebas text-lg text-offwhite mb-4">Content</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/news"
                  className="text-slate-muted hover:text-neon-purple transition-colors text-sm"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/podcast"
                  className="text-slate-muted hover:text-neon-purple transition-colors text-sm"
                >
                  Podcast
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="text-slate-muted hover:text-neon-purple transition-colors text-sm"
                >
                  Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bebas text-lg text-offwhite mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-slate-muted hover:text-neon-purple transition-colors text-sm"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  href="/about#advertise"
                  className="text-slate-muted hover:text-neon-purple transition-colors text-sm"
                >
                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  href="/about#contact"
                  className="text-slate-muted hover:text-neon-purple transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bebas text-lg text-offwhite mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/latenightlakeshow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-muted hover:text-neon-purple transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/latenightlakeshow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-muted hover:text-neon-purple transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@latenightlakeshow"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-muted hover:text-neon-purple transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-muted/20 mt-8 pt-8 text-center">
          <p className="text-slate-muted text-sm">
            © {new Date().getFullYear()} Late Night Lake Show. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
