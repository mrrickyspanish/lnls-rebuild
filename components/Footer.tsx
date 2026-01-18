import Link from 'next/link';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 mt-auto">
      {/* Newsletter Section - Full Width */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <NewsletterSignup />
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 font-netflix">
              The Daily Dribble
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Court. Code. Culture. Where basketball meets technology and lifestyle.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/thedailydribble"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://instagram.com/thedailydribble"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://youtube.com/@thedailydribble"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://facebook.com/thedailydribble"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Content Links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Content
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/news"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/podcast"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Podcast
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Videos
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Topics
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/news?topic=Lakers"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Lakers News
                </Link>
              </li>
              <li>
                <Link
                  href="/news?topic=NBA"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  NBA Coverage
                </Link>
              </li>
              <li>
                <Link
                  href="/news?topic=Tech"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Tech & Culture
                </Link>
              </li>
              <li>
                <Link
                  href="/news?topic=Culture"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Sports Culture
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Write for Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-white/40 text-sm">
              © {currentYear} The Daily Dribble. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-white/30 text-xs mt-4 text-center md:text-left">
            The Daily Dribble is an independent media outlet and is not affiliated with the NBA or any specific team.
          </p>
        </div>
      </div>
    </footer>
  );
}
