import NewsletterSignup from '@/components/NewsletterSignup'
import { Mail, Zap, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Subscribe',
  description: 'Get the latest Lakers news and LNLS updates delivered daily.',
}

export default function SubscribePage() {
  return (
    <div className="section-container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-bebas gradient-text mb-4">
            Never Miss a Beat
          </h1>
          <p className="text-lg text-slate-muted max-w-2xl mx-auto">
            Subscribe to the LNLS newsletter and get daily Lakers news, podcast drops, and exclusive content straight to your inbox.
          </p>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-16">
          <NewsletterSignup />
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon-purple/20 mb-4">
              <Zap className="w-6 h-6 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bebas text-offwhite mb-2">
              Breaking News First
            </h3>
            <p className="text-sm text-slate-muted">
              Get Lakers updates before they hit social media. Trade rumors, injury reports, game recaps — all in one place.
            </p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon-gold/20 mb-4">
              <Calendar className="w-6 h-6 text-neon-gold" />
            </div>
            <h3 className="text-xl font-bebas text-offwhite mb-2">
              Weekly Recaps
            </h3>
            <p className="text-sm text-slate-muted">
              Can't keep up with every game? Our weekly digest breaks down what matters and what's next.
            </p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon-purple/20 mb-4">
              <Mail className="w-6 h-6 text-neon-purple" />
            </div>
            <h3 className="text-xl font-bebas text-offwhite mb-2">
              Exclusive Content
            </h3>
            <p className="text-sm text-slate-muted">
              Subscriber-only analysis, early episode access, and behind-the-scenes content from the LNLS team.
            </p>
          </div>
        </div>

        {/* Social Follow */}
        <div className="card text-center">
          <h2 className="text-3xl font-bebas gradient-text mb-4">
            Follow LNLS Everywhere
          </h2>
          <p className="text-slate-muted mb-6">
            Stay connected on all platforms for real-time updates and community vibes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://twitter.com/latenightlakeshow"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              X/Twitter
            </a>
            <a
              href="https://instagram.com/latenightlakeshow"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Instagram
            </a>
            <a
              href="https://youtube.com/@latenightlakeshow"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              YouTube
            </a>
            <a
              href="https://tiktok.com/@latenightlakeshow"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
