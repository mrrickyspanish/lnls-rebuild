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
    <section className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-32 space-y-32">
        
        {/* MAIN MESSAGE */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-12 leading-tight">
              We don&apos;t just cover the game.
              <span className="block text-primary mt-4">We live it.</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary leading-relaxed">
              No corporate talking heads. No recycled press releases.<br />
              Just real fans, writers, creators, and analysts who breathe this world every single day.
            </p>
          </div>
        </div>

        {/* THREE LANES */}
        <div className="bg-surface/30 py-20 px-6 rounded-2xl backdrop-blur-sm border border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-center mb-16">
              Three lanes.<br />One feed.
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {lanes.map((lane) => (
                <div key={lane.title} className="text-center group hover:shadow-[var(--glow-orange)] transition-all rounded-xl p-8">
                  <div className={`text-7xl md:text-8xl lg:text-9xl font-display font-bold mb-6 ${lane.className}`}>
                    {lane.title}
                  </div>
                  <p className="text-lg md:text-xl text-secondary leading-relaxed">{lane.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FINAL CTA */}
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-display font-bold mb-8 leading-tight">
            Join the movement.
          </h2>
          <p className="text-xl md:text-2xl text-secondary mb-12 max-w-2xl mx-auto">
            Subscribe free and never miss a dribble.
          </p>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-3 px-12 py-6 bg-primary text-black text-xl font-bold rounded-full hover:shadow-[var(--glow-orange)] transition-all"
          >
            Subscribe Now <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </section>
  );
}