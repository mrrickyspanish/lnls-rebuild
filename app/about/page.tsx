import Link from 'next/link'

import { SITE_OWNER, SITE_OWNER_X_URL } from '@/lib/author'

/**
 * Lane colors follow the site-wide topic-family rule (lib/topics.ts):
 * Court is on-field coverage, Code is analysis, Culture is lifestyle. The same
 * three families color story tags and art on the front page, so a color here
 * means the same thing it means there.
 *
 * Court names what the desk actually publishes (NBA, football, recruiting):
 * these are the topics the admin editor writes. The old copy said "NBA,
 * college, and the global game", which no longer matched the site's scope.
 */
const lanes = [
  {
    title: 'Court',
    family: 'games',
    desc: 'The sharpest takes on the NBA, football, recruiting, and the global game. No fluff.',
  },
  {
    title: 'Code',
    family: 'analysis',
    desc: 'Tech, analytics, sneakers, and gaming. Everything shaping the future of the sport.',
  },
  {
    title: 'Culture',
    family: 'culture',
    desc: 'Fashion, music, film, and art. The lifestyle that grew up around the game.',
  },
]

export const metadata = {
  title: 'About',
  description: `The Daily Dribble is ${SITE_OWNER.name}'s home for sports, tech, and the culture around the game.`,
}

const handle = SITE_OWNER.twitter.replace(/^@/, '')

export default function AboutPage() {
  return (
    <div className="tdd-home tdd-about">
      <header className="tdd-about-hero">
        <h1>
          <span data-family="games">Court.</span>
          <span data-family="analysis">Code.</span>
          <span data-family="culture">Culture.</span>
        </h1>
        <p>Sports, tech, and the culture around the game.</p>
      </header>

      {/* One writer, and the site says so: the byline on every story links
          here. Written in first person on purpose. */}
      <section className="tdd-about-section tdd-about-me" aria-labelledby="about-me">
        <h2 id="about-me">One writer. My name on every piece.</h2>
        <p>
          I&apos;m {SITE_OWNER.name}, founder of The Daily Dribble and Creative Eye Studios.
          I&apos;m a digital creator and sports storyteller mixing hoops, culture, and life.
          Patiently persistent.
        </p>
        <p>
          This is my home for the topics I care about. Every take here is mine, and so is every mistake,
          which is why I&apos;m upfront about both.
        </p>
        <p>
          <a href={SITE_OWNER_X_URL} target="_blank" rel="noopener noreferrer" className="tdd-about-link">
            Find me on X: @{handle}
          </a>
        </p>
      </section>

      <section className="tdd-about-section" aria-labelledby="about-lanes">
        <h2 id="about-lanes">Three lanes. One feed.</h2>
        <div>
          {lanes.map(lane => (
            <div className="tdd-about-lane" data-family={lane.family} key={lane.title}>
              <h3>{lane.title}</h3>
              <p>{lane.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tdd-about-section tdd-about-statement">
        <h2>
          <span>I don&apos;t just cover the game.</span>
          <span>I live it.</span>
        </h2>
        <p>
          No corporate talking heads. No recycled press releases. Just me: a fan, a writer, and a
          creator who breathes this world every single day.
        </p>
      </section>

      <section className="tdd-about-section" aria-labelledby="about-standards">
        <h2 id="about-standards">You&apos;ll always know what you&apos;re reading.</h2>
        <p>
          Every piece is labeled Opinion, Analysis, Report or Rumor. A rumor names who&apos;s reporting it.
          When I get something wrong, I fix it and say so at the top of the story.
        </p>
        <p>
          <Link href="/standards" className="tdd-about-link">How I work</Link>
        </p>
      </section>

      <section className="tdd-about-section tdd-about-cta">
        <h2>Join the movement.</h2>
        <p>Subscribe free and never miss a dribble.</p>
        <Link href="/subscribe" className="tdd-cta">Subscribe</Link>
      </section>
    </div>
  )
}
