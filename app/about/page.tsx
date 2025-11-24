import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const lanes = [
  {
    title: 'Court',
    desc: 'The sharpest takes on the NBA, college, and the global game. No fluff.',
    className: 'text-primary',
  },
  {
    title: 'Code',
    desc: 'Tech, analytics, sneakers, gaming — everything shaping the future of the sport.',
    className: 'text-secondary',
  },
  {
    title: 'Culture',
    desc: 'Fashion, music, film, art — the lifestyle that grew up around the game.',
    className: 'text-accent',
  },
];

export const metadata = {
  title: 'About – The Daily Dribble',
  description: 'Court. Code. Culture.',
};

export default function AboutPage() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-32 md:pt-40 pb-32 space-y-24">
        
        {/* COURT. CODE. CULTURE. - Lead with value prop */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Court. Code. Culture.
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto">
            Where basketball meets technology and lifestyle.
          </p>
        </div>

        {/* THREE LANES - Show what we do */}
        <div className="bg-surface/30 py-16 px-6 rounded-2xl backdrop-blur-sm border border-white/5">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Three lanes. One feed.
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {lanes.map((lane) => (
              <div key={lane.title} className="text-center group hover:shadow-[var(--glow-orange)] transition-all rounded-xl p-6">
                <div className={`text-6xl md:text-7xl font-display font-bold mb-4 ${lane.className}`}>
                  {lane.title}
                </div>
                <p className="text-base md:text-lg text-secondary leading-relaxed">{lane.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DIFFERENTIATION */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-8 leading-tight">
            We don&apos;t just cover the game.
            <span className="block text-primary mt-3">We live it.</span>
          </h2>
          <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-3xl mx-auto">
            No corporate talking heads. No recycled press releases. Just real fans, writers, creators, and analysts who breathe this world every single day.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Join the movement.
          </h3>
          <p className="text-lg md:text-xl text-secondary mb-8 max-w-xl mx-auto">
            Subscribe free and never miss a dribble.
          </p>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-black text-lg font-bold rounded-full hover:shadow-[var(--glow-orange)] transition-all"
          >
            Subscribe Now <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}