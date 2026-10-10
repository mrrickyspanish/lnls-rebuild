'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useAudioPlayer } from '@/lib/audio/AudioPlayerContext'
import { topicFamily, PODCAST_FAMILY, VIDEO_FAMILY } from '@/lib/topics'
import { pieceTypeInfo } from '@/lib/articles/piece-type'

export type EditorialItem = {
  id: string | number; title: string; excerpt?: string; description?: string;
  image_url?: string | null; source_url?: string | null; published_at?: string | null;
  content_type?: string | null; topic?: string; author_name?: string; audio_url?: string;
  article_type?: string | null; cover_has_text?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const

function summary(item: EditorialItem, limit = 180) {
  const text = (item.excerpt || item.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  return text.slice(0, limit - 3).replace(/\s+\S*$/, '') + '...'
}

function date(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return ''
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

/** Byline and date on one line. At most one middot, and only when both halves exist. */
function credit(item: EditorialItem) {
  return [item.author_name, date(item.published_at)].filter(Boolean).join(' · ')
}

/**
 * Art, in true color. Clean covers fill their frame. A cover with words
 * designed into it (cover_has_text) is shown whole instead, over a blurred
 * copy of itself, so its words are never cropped off.
 */
function Shot({ item, family, className = '' }: { item: EditorialItem; family: string; className?: string }) {
  const whole = Boolean(item.cover_has_text && item.image_url)
  return (
    <div
      className={`tdd-shot ${whole ? 'tdd-shot--whole' : ''} ${className}`}
      data-family={family}
      style={whole ? ({ '--shot': `url(${JSON.stringify(item.image_url)})` } as React.CSSProperties) : undefined}
    >
      {item.image_url
        ? <img src={item.image_url} alt="" loading="lazy" decoding="async" />
        : <span className="tdd-shot-fallback" aria-hidden="true">TDD</span>}
    </div>
  )
}

/** Scroll reveal. Motivated: the feed arrives in reading order instead of all at once. */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Topic tag plus the piece label (Opinion, Analysis, Report, Rumor). */
function Tag({ topic, type }: { topic?: string; type?: string | null }) {
  const label = pieceTypeInfo(type)
  const showTopic = topic && topic !== 'FEATURED'
  if (!showTopic && !label) return null
  return (
    <div className="tdd-tags">
      {showTopic && <span className="tdd-tag" data-family={topicFamily(topic)}>{topic}</span>}
      {label && <span className="tdd-kind" data-kind={label.value}>{label.label}</span>}
    </div>
  )
}

export default function EditorialHome({
  articles, podcasts, videos, dateline,
}: {
  articles: EditorialItem[]; podcasts: EditorialItem[]; videos: EditorialItem[]; dateline: string
}) {
  const { playEpisode, currentEpisode, isPlaying } = useAudioPlayer()
  const reduce = useReducedMotion()

  const cover = articles[0]
  const deck = articles.slice(1, 3)
  const index = articles.slice(3, 11)
  const queue = podcasts.map(episode => ({
    id: String(episode.id),
    title: episode.title,
    audio_url: episode.audio_url || episode.source_url!,
    image_url: episode.image_url || undefined,
  }))

  return (
    <div className="tdd-home">
      {/* The one small label on the page. This publication is called The Daily
          Dribble and had no date anywhere on it, which is the identity hook it
          was missing. */}
      <div className="tdd-dateline">
        <p className="tdd-dateline-date">{dateline}</p>
        <p className="tdd-dateline-line">Sports, tech, and the culture around the game.</p>
      </div>

      {cover ? (
        <motion.article
          className="tdd-cover"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Link href={cover.source_url || '/news'} className="tdd-cover-link">
            <motion.div
              className="tdd-cover-art"
              initial={reduce ? false : { clipPath: 'inset(0 0 18% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 0.85, ease: EASE }}
            >
              <Shot item={cover} family={topicFamily(cover.topic)} />
            </motion.div>

            <motion.div
              className="tdd-cover-copy"
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              <Tag topic={cover.topic} type={cover.article_type} />
              {/* Long headlines step down a size instead of running to seven
                  lines (globals.css, .tdd-cover-copy h1[data-length]). */}
              <h1 data-length={cover.title.length > 90 ? 'xlong' : cover.title.length > 60 ? 'long' : undefined}>{cover.title}</h1>
              {summary(cover, 210) && <p className="tdd-cover-summary">{summary(cover, 210)}</p>}
              {credit(cover) && <p className="tdd-credit">{credit(cover)}</p>}
              <span className="tdd-cta">Read the story</span>
            </motion.div>
          </Link>
        </motion.article>
      ) : (
        <section className="tdd-empty">
          <h1>The next issue is being written.</h1>
          <p>No stories have published yet. The podcast archive and the video feed below are live now.</p>
          <Link className="tdd-cta" href="/podcast">Open the podcast</Link>
        </section>
      )}

      {deck.length > 0 && (
        <section className="tdd-deck" aria-label="More from this issue">
          {deck.map((item, position) => (
            <Reveal key={item.id} delay={position * 0.08} className="tdd-deck-cell">
              <Link href={item.source_url || '/news'} className="tdd-deck-story">
                <Shot item={item} family={topicFamily(item.topic)} className="tdd-deck-art" />
                <div>
                  <Tag topic={item.topic} type={item.article_type} />
                  <h3>{item.title}</h3>
                  {credit(item) && <p className="tdd-credit">{credit(item)}</p>}
                </div>
              </Link>
            </Reveal>
          ))}
        </section>
      )}

      {index.length > 0 && (
        <section className="tdd-section tdd-index-section">
          <div className="tdd-section-head">
            <h2>Latest stories</h2>
            <Link href="/news" className="tdd-more">All articles</Link>
          </div>
          {/* Type only, no art. The density drop against the cover above is the
              point: a front page that never changes gear reads as a template. */}
          <div className="tdd-index">
            {index.map((item, position) => (
              <Reveal key={item.id} delay={Math.min(position, 5) * 0.05}>
                <Link href={item.source_url || '/news'} className="tdd-index-story">
                  <Tag topic={item.topic} type={item.article_type} />
                  <h3>{item.title}</h3>
                  {credit(item) && <p className="tdd-credit">{credit(item)}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section className="tdd-section tdd-pod-section">
          <div className="tdd-section-head">
            <h2>Late Night Lake Show</h2>
            <Link href="/podcast" className="tdd-more">All episodes</Link>
          </div>
          <Reveal className="tdd-pod">
            <Shot item={podcasts[0]} family={PODCAST_FAMILY} className="tdd-pod-art" />
            <ul className="tdd-pod-list">
              {podcasts.slice(0, 3).map(episode => {
                const live = currentEpisode?.id === String(episode.id) && isPlaying
                return (
                  <li key={episode.id}>
                    <div className="tdd-pod-copy">
                      <h3>{episode.title}</h3>
                      {date(episode.published_at) && <p className="tdd-credit">{date(episode.published_at)}</p>}
                    </div>
                    <button
                      type="button"
                      className="tdd-play"
                      disabled={!episode.audio_url && !episode.source_url}
                      aria-label={live ? `Now playing: ${episode.title}` : `Play: ${episode.title}`}
                      onClick={() => playEpisode({
                        id: String(episode.id),
                        title: episode.title,
                        audio_url: episode.audio_url || episode.source_url!,
                        image_url: episode.image_url || undefined,
                      }, queue)}
                    >
                      <Play size={15} strokeWidth={2.5} aria-hidden="true" />
                      {live ? 'Playing' : 'Play'}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </section>
      )}

      {videos.length > 0 && (
        <section className="tdd-section">
          <div className="tdd-section-head">
            <h2>Videos</h2>
            <Link href="/videos" className="tdd-more">All videos</Link>
          </div>
          <div className="tdd-video">
            {videos.slice(0, 3).map((item, position) => (
              <Reveal key={item.id} delay={position * 0.08} className={position === 0 ? 'tdd-video-lead' : undefined}>
                {/* Video links point at YouTube. Open off-site, so the reader
                    does not lose the front page. */}
                <a
                  href={item.source_url || '/videos'}
                  className="tdd-video-story"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Shot item={item} family={VIDEO_FAMILY} className="tdd-video-art" />
                  <h3>{item.title}</h3>
                  {date(item.published_at) && <p className="tdd-credit">{date(item.published_at)}</p>}
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
