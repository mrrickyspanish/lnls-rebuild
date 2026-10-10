import Link from 'next/link'

import { PIECE_TYPES } from '@/lib/articles/piece-type'
import { CONTACT_EMAIL } from '@/lib/contact'

export const metadata = {
  title: 'How I Work',
  description: 'How The Daily Dribble labels opinion, analysis, reporting and rumors, and how mistakes get corrected.',
}

const CORRECTION_MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Correction')}`

/**
 * The site's standards, in the owner's voice. Every story's label links to
 * its entry here (#opinion, #analysis, #report, #rumor), and the rumor line
 * links to #rumor. The label definitions come from lib/articles/piece-type.ts
 * so this page and the editor can't disagree.
 */
export default function StandardsPage() {
  return (
    <div className="tdd-home tdd-standards">
      <header className="tdd-standards-hero">
        <h1>How I work</h1>
        <p>
          This is my site. Here&apos;s how I run it, so you know what you&apos;re reading and what you can hold me to.
        </p>
      </header>

      <section className="tdd-standards-section" aria-labelledby="standards-labels">
        <h2 id="standards-labels">Every piece gets a label.</h2>
        <p>You&apos;ll see one of these at the top of every story and on every story card.</p>
        <div className="tdd-standards-types">
          {PIECE_TYPES.map((type) => (
            <div className="tdd-standards-type" id={type.value} key={type.value}>
              <span className="tdd-kind" data-kind={type.value}>{type.label}</span>
              <p>{type.definition}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tdd-standards-section" id="rumors" aria-labelledby="standards-rumors">
        <h2 id="standards-rumors">Rumors stay rumors.</h2>
        <p>
          A rumor is labeled Rumor, every time, and the top of the story says who&apos;s reporting it and that
          it isn&apos;t confirmed. When it&apos;s confirmed or falls apart, I add a dated update to the story.
        </p>
      </section>

      <section className="tdd-standards-section" id="corrections" aria-labelledby="standards-corrections">
        <h2 id="standards-corrections">When I get it wrong, I say so.</h2>
        <p>
          If a fact in a story is wrong, I fix it and put a dated correction at the top of the story saying
          what changed. I don&apos;t quietly edit mistakes away. When a story moves on after it&apos;s published,
          I add a dated update instead.
        </p>
        <p>
          Spotted something? <a href={CORRECTION_MAIL}>Email me at {CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section className="tdd-standards-section" aria-labelledby="standards-mine">
        <h2 id="standards-mine">The takes are mine.</h2>
        <p>
          I write everything here myself. The Daily Dribble is independent and isn&apos;t
          affiliated with the NBA or any team. <Link href="/about">More about me</Link>.
        </p>
      </section>
    </div>
  )
}
