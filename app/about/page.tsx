import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_OWNER, SITE_OWNER_X_URL } from '@/lib/author'
import { getSiteUrl } from '@/lib/site'
import styles from './about.module.css'

const description = 'Meet Richard “RJ” Barnes Jr., also known as Ricky Barnes and published as Rick Barnes Jr. Founder of The Daily Dribble and Creative Eye Studios, Citi VP, and Late Night Lake Show co-host.'
export const metadata: Metadata = {
  title: 'About Rick Barnes Jr. | RJ & Ricky Barnes',
  description,
  alternates: { canonical: '/about' },
  openGraph: { title: 'The voice behind The Daily Dribble', description, url: '/about', type: 'profile', firstName: 'Richard', lastName: 'Barnes Jr.' },
  twitter: { card: 'summary_large_image', title: 'Rick Barnes Jr. | The Daily Dribble', description },
}

const lanes = [
  { title: 'Court', family: 'court', desc: 'The NBA, football, recruiting, and the stories beyond the final score.' },
  { title: 'Code', family: 'code', desc: 'Technology, AI, and gaming. What’s useful, what’s changing, and what deserves a closer look.' },
  { title: 'Culture', family: 'culture', desc: 'Music, film, fashion, and the conversations that follow us off the court.' },
  { title: 'Life', family: 'life', desc: 'Marriage, fatherhood, and life at my own front door. It’s where a lot of my takes start.' },
]
const stories = [
  { family: 'court', label: 'Sports', title: 'Luka Dončić Has the Crown. Do the Lakers Have Enough?', slug: 'luka-don-i-has-the-crown-do-the-lakers-have-enough', image: '1963_0_u71i_1792543051639.png' },
  { family: 'code', label: 'Technology', title: 'Four Days With Meta’s Muse, and I’m Starting to Get It', slug: 'four-days-with-meta-s-muse-and-i-m-starting-to-get-it', image: 'muse_cover_1791145319061.webp' },
  { family: 'culture', label: 'Culture', title: 'Ticketmaster Is Back in Trouble, and Fans Are Still the Ones Paying for It', slug: 'ticketmaster-is-back-in-trouble-and-fans-are-still-the-ones-paying-for-it', image: 'ticketmaster_rant_cover_photo_1777089893664.png' },
]
const chapters = [
  {
    id: 'media', label: '01 / Media & storytelling', title: 'The Daily Dribble & Late Night Lake Show',
    paragraphs: [
      'Barnes is the founder and writer behind The Daily Dribble, an independent publication exploring sports, technology, culture, and everyday life. His writing brings a fan’s investment, a marketer’s perspective, and a producer’s attention to the story.',
      'He is also the founder and co-host of Late Night Lake Show, a Lakers-focused podcast launched in 2018. Through conversations, interviews, and live commentary, he brings analysis, humor, and the energy of fan culture to the stories surrounding the team.',
      'Across written, audio, and video formats, his approach is direct: bring a point of view, give it substance, and make the conversation worth joining.',
    ],
  },
  {
    id: 'enterprise', label: '02 / Enterprise leadership', title: 'Strategy that makes it into execution',
    paragraphs: [
      'Barnes serves as a Vice President at Citi, working in customer management program integration. His work connects customer journey strategy with campaign execution, helping translate business objectives into coordinated experiences across digital channels.',
      'Previously, he served as Principal Portfolio Marketing Manager at Discover Financial Services, focused on the new cardmember journey. His experience spans onboarding, engagement, loyalty, and retention, with an emphasis on aligning teams, managing complex requirements, and moving initiatives from planning into execution.',
      'A 2014 marketing graduate of Illinois State University, Barnes was recognized with the College of Business’s 2022–2023 Early Career Achievement Award.',
    ],
  },
  {
    id: 'studio', label: '03 / Creative Eye Studios', title: 'The brand. The platform. The business behind it.',
    paragraphs: [
      'As founder of Creative Eye Studios, Barnes helps businesses, creators, and community organizations build the brand, platforms, and systems behind their growth.',
      'His work combines brand strategy, website development, content production, and practical business technology. Projects range from digital publications and athlete recruiting platforms to lead-generation campaigns, application workflows, and custom dashboards.',
      'He stays involved from strategy through launch, connecting what audiences see with the processes that support the business. AI and automation are part of that approach, applied where they can improve execution, expand creative possibilities, or remove repetitive work.',
    ],
  },
  {
    id: 'community', label: '04 / Community & what comes next', title: 'Bring the knowledge back home',
    paragraphs: [
      'Through Creative Eye Forward, Barnes is extending his work into AI literacy and digital creativity, helping young people develop critical thinking, communication, and practical skills for a changing world.',
      'The connection across his work is intentional. Corporate experience shapes how he builds. Creative work shapes how he communicates. Media keeps him close to how people think, react, and connect.',
      'He lives in the Chicago suburbs with his wife, Ashley, and their two children.',
    ],
  },
]

export default function AboutPage() {
  const person = {
    '@context': 'https://schema.org', '@type': 'ProfilePage',
    '@id': `${getSiteUrl()}/about#profile`, url: `${getSiteUrl()}/about`,
    mainEntity: {
      '@type': 'Person', '@id': `${getSiteUrl()}/about#person`, name: SITE_OWNER.name,
      alternateName: ['Richard Barnes Jr.', 'Richard “RJ” Barnes Jr.', 'RJ Barnes', 'Ricky Barnes'],
      description, url: `${getSiteUrl()}/about`,
      sameAs: [SITE_OWNER_X_URL, 'https://www.linkedin.com/in/rjbarnes1'],
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Illinois State University' },
      award: '2022–2023 College of Business Early Career Achievement Award, Illinois State University',
    },
  }
  return (
    <div className={`tdd-home ${styles.page}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }} />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>The voice behind The Daily Dribble</p>
        <h1>Rick Barnes Jr.</h1>
        <p className={styles.roles}>Marketing leader. Founder. Media producer.</p>
        <p className={styles.intro}>I bring a fan’s investment, a marketer’s perspective, and a producer’s attention to the story. Sports, technology, culture, and life at home. This is where it all comes together.</p>
        <nav className={styles.links} aria-label="Explore Rick’s work">
          <Link href="/news" className="tdd-cta">Read my stories</Link>
          <Link href="/podcast" className="tdd-about-link">Listen to Late Night Lake Show ↗</Link>
        </nav>
        {/* Portrait can be added here once Rick selects the photograph. The text-only hero is complete without a placeholder. */}
      </header>

      <ul className={styles.credentials} aria-label="Selected credentials">
        <li><strong>Citi</strong><span>Vice President</span></li>
        <li><strong>Creative Eye Studios</strong><span>Founder</span></li>
        <li><strong>Late Night Lake Show</strong><span>Founder & co-host · Since 2018</span></li>
        <li><strong>Illinois State University</strong><span>Early Career Achievement Award · 2022–2023</span></li>
      </ul>

      <section className={styles.section} aria-labelledby="about-publication">
        <div><p className={styles.eyebrow}>The publication</p><h2 id="about-publication">Four lanes.<br />One perspective.</h2></div>
        <div className={styles.copy}>
          <p>The Daily Dribble is my independent home for the topics I care about. A game can lead to a conversation about business. A new piece of technology can change how we work or how we live. I follow those connections.</p>
          <div className={styles.lanes}>{lanes.map(lane => <div key={lane.title} data-family={lane.family}><h3>{lane.title}.</h3><p>{lane.desc}</p></div>)}</div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="about-bio">
        <div><p className={styles.eyebrow}>The person behind the byline</p><h2 id="about-bio">Richard “RJ”<br />Barnes Jr.</h2></div>
        <div className={styles.copy}>
          <p>Richard “RJ” Barnes Jr., also known as Ricky Barnes and published as Rick Barnes Jr., is a marketing and operations leader, entrepreneur, and media producer based in the Chicago area. His work spans enterprise customer engagement, digital business systems, and independent media, connecting the strategy behind a business with the stories and experiences that bring people to it.</p>
          <p>Across corporate leadership, Creative Eye Studios, and sports media, Barnes brings an operator’s discipline and a creator’s instincts to the same question: How do you turn a strong idea into something people understand, trust, and return to?</p>
        </div>
      </section>
      {chapters.map(chapter => <section className={styles.section} key={chapter.id} aria-labelledby={`about-${chapter.id}`}>
        <div><p className={styles.eyebrow}>{chapter.label}</p><h2 id={`about-${chapter.id}`}>{chapter.title}</h2></div>
        <div className={styles.copy}>
          {chapter.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {chapter.id === 'studio' && <a href="https://www.creativeeyestudios.com/" className="tdd-about-link">Explore Creative Eye Studios ↗</a>}
          {chapter.id === 'enterprise' && <a href="https://business.illinoisstate.edu/alumni/awards/ecaa2223/" className="tdd-about-link">Read the Illinois State recognition ↗</a>}
        </div>
      </section>)}

      <section className={styles.selected} aria-labelledby="about-stories">
        <p className={styles.eyebrow}>A few places to start</p><h2 id="about-stories">Get to know the perspective.</h2>
        <div className={styles.stories}>{stories.map(story => <Link href={`/news/${story.slug}`} className={styles.story} key={story.slug} data-family={story.family}>
          {/* These are existing article assets, served directly like the story index. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://rqbrshlalcscpvdtmxvc.supabase.co/storage/v1/object/public/Article%20Images/articles/${story.image}`} alt="" width={720} height={480} loading="lazy" />
          <p>{story.label}</p><h3>{story.title}</h3><span>Read the story ↗</span>
        </Link>)}</div>
      </section>

      <section className={styles.section} aria-labelledby="about-standards">
        <div><p className={styles.eyebrow}>Independent by design</p><h2 id="about-standards">My name.<br />My point of view.</h2></div>
        <div className={styles.copy}>
          <p>Every take here is mine, and so is every mistake. Pieces are labeled Opinion, Analysis, Report, or Rumor. A rumor names who’s reporting it. When I get something wrong, I fix it and say so at the top of the story.</p>
          <p>The Daily Dribble is independent. The views expressed here are my own and do not represent my employer or clients.</p>
          <nav className={styles.links} aria-label="Standards and contact"><Link href="/standards" className="tdd-about-link">How I work</Link><Link href="/contact" className="tdd-about-link">Get in touch</Link><a href={SITE_OWNER_X_URL} className="tdd-about-link">Find me on X ↗</a><a href="https://www.linkedin.com/in/rjbarnes1" className="tdd-about-link">LinkedIn ↗</a></nav>
        </div>
      </section>
      {/* The shared footer provides the single newsletter signup for this page. */}
    </div>
  )
}
