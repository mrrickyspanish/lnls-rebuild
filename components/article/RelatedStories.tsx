import Link from 'next/link'

import { topicFamily } from '@/lib/topics'
import type { Article } from '@/types/supabase'

type RelatedStoriesProps = {
  articles: Article[]
}

function credit(article: Article) {
  const when = article.published_at || article.created_at
  const date = when && !Number.isNaN(Date.parse(when))
    ? new Date(when).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : ''
  return [article.author_name, date].filter(Boolean).join(' · ')
}

/**
 * "Keep Digging": three stories to read next, as a row of cards on desktop
 * and a stack on phones. It replaced a sideways-scrolling carousel of
 * grayscale tiles (RelatedRow + ContentTile), which hid two of its cards off
 * screen on a phone. Art is shown in true color here; the topic shows in the
 * tag, the same way it does on the article itself.
 */
export default function RelatedStories({ articles }: RelatedStoriesProps) {
  if (articles.length === 0) return null

  return (
    <section className="tdd-related" aria-labelledby="keep-digging">
      <div className="tdd-related-head">
        <h2 id="keep-digging">Keep Digging</h2>
        <Link href="/news" className="tdd-more">All articles</Link>
      </div>
      <ul className="tdd-related-grid">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/news/${article.slug}`} className="tdd-related-story">
              <div className="tdd-related-art">
                {article.hero_image_url
                  ? <img src={article.hero_image_url} alt="" loading="lazy" decoding="async" />
                  : <span className="tdd-related-fallback" aria-hidden="true">TDD</span>}
              </div>
              {article.topic && article.topic !== 'FEATURED' && (
                <span className="tdd-tag" data-family={topicFamily(article.topic)}>{article.topic}</span>
              )}
              <h3>{article.title}</h3>
              {credit(article) && <p className="tdd-credit">{credit(article)}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
