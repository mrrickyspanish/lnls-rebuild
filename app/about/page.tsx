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
    <>
      {/* HERO – top-left title, cinematic */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background pb-48">
          <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-32">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
              About
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-[var(--text-secondary)] max-w-xl">
              Court. Code. Culture.
            </p>
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-20 pt-20 px-6 pb-32">
          <div className="max-w-7xl mx-auto space-y-24">
            {/* MAIN MESSAGE */}
            <section className="text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-6xl md:text-8xl font-display font-bold mb-12">
                  We don&apos;t just cover the game.
                  <span className="block text-primary">We live it.</span>
                </h2>
                <p className="text-xl md:text-2xl text-secondary leading-relaxed">
                  No corporate talking heads. No recycled press releases.<br />
                  Just real fans, writers, creators, and analysts who breathe this world every single day.
                </p>
              </div>
            </section>

            {/* THREE LANES */}
            <section className="bg-surface/30 py-24 px-6 rounded-2xl">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-display font-bold text-center mb-20">
                  Three lanes.<br />One feed.
                </h2>
                <div className="grid md:grid-cols-3 gap-12">
                  {lanes.map((lane) => (
                    <div key={lane.title} className="text-center group hover:shadow-[var(--glow-orange)] transition-all rounded-xl p-6">
                      <div className={`text-9xl font-display font-bold mb-6 ${lane.className}`}>
                        {lane.title}
                      </div>
                      <p className="text-xl text-secondary">{lane.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FINAL CTA */}
            <section className="text-center">
              <h2 className="text-6xl md:text-8xl font-display font-bold mb-8">
                Join the movement.
              </h2>
              <p className="text-2xl text-secondary mb-12 max-w-2xl mx-auto">
                Subscribe free and never miss a dribble.
              </p>
              <Link
                href="/subscribe"
                className="inline-flex items-center gap-3 px-12 py-6 bg-primary text-black text-xl font-bold rounded-full hover:shadow-[var(--glow-orange)] transition-all"
              >
                Subscribe Now <ChevronRight className="w-6 h-6" />
              </Link>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
