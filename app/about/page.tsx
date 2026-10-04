import Link from 'next/link'

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
  description: 'Sports, tech, and the culture around the game.',
}

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
          <span>We don&apos;t just cover the game.</span>
          <span>We live it.</span>
        </h2>
        <p>
          No corporate talking heads. No recycled press releases. Just real fans, writers,
          creators, and analysts who breathe this world every single day.
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
