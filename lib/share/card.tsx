import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

import { pieceTypeInfo } from '@/lib/articles/piece-type'
import type { Article } from '@/types/supabase'

/**
 * Share graphics, generated from the story: the link preview (X, iMessage,
 * Facebook) and three downloadable sizes for Instagram and other feeds.
 *
 * Layout: the cover image on top, a solid black band below with the label,
 * the headline in Anton and the wordmark. The band means the headline is
 * readable whatever the image is. The image area in the portrait sizes is
 * exactly 16:9, so a clean 16:9 cover is shown uncropped.
 *
 * The image is left out (type only) when the cover has words designed into
 * it, so the headline never appears twice, and when it can't be drawn: the
 * renderer reads JPEG and PNG only, not WebP or GIF.
 */
export const SHARE_FORMATS = {
  og: { width: 1200, height: 630, label: 'Link preview' },
  post: { width: 1080, height: 1350, label: 'Post (4:5)' },
  story: { width: 1080, height: 1920, label: 'Story (9:16)' },
  square: { width: 1080, height: 1080, label: 'Square (1:1)' },
} as const

export type ShareFormat = keyof typeof SHARE_FORMATS

export function isShareFormat(value: string): value is ShareFormat {
  return value in SHARE_FORMATS
}

const INK = '#F2F2EF'
const MUTED = '#A8ACB2'
const BLACK = '#0D0D0D'
const ORANGE = '#FF6B35'
const BLUE = '#00D4FF'
const PURPLE = '#B857FF'

type CardArticle = Pick<Article, 'title' | 'hero_image_url' | 'article_type' | 'cover_has_text'>

/** Fetches the cover as a data URL, or null if it can't be drawn. */
async function loadCover(src: string | null | undefined, origin: string): Promise<string | null> {
  if (!src) return null
  const url = src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!response.ok) return null
    const type = (response.headers.get('content-type') || '').split(';')[0].trim()
    if (type !== 'image/jpeg' && type !== 'image/png') return null
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length > 8 * 1024 * 1024) return null
    return `data:${type};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

/**
 * Largest headline size that fits the box. Anton is condensed: an uppercase
 * character averages a bit under half its size in width, so wrap is
 * simulated word by word at 0.5em per character to stay on the safe side.
 */
function fitHeadline(text: string, width: number, height: number, max: number, min: number) {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean)
  for (let size = max; size >= min; size -= 2) {
    const perLine = width / (size * 0.5)
    let lines = 1
    let used = 0
    for (const word of words) {
      const needed = used === 0 ? word.length : used + 1 + word.length
      if (needed <= perLine) used = needed
      else { lines += 1; used = word.length }
    }
    if (lines * size * 0.98 <= height) return size
  }
  return min
}

function Wordmark({ size }: { size: number }) {
  const dot = Math.round(size * 0.22)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: Math.round(size * 0.3), letterSpacing: Math.round(size * 0.08), color: MUTED }}>THE DAILY</div>
        <div style={{ fontSize: size, lineHeight: 1, color: INK }}>DRIBBLE</div>
      </div>
      <div style={{ display: 'flex', marginLeft: Math.round(size * 0.18), marginBottom: Math.round(size * 0.12) }}>
        <div style={{ width: dot, height: dot, background: ORANGE }} />
        <div style={{ width: dot, height: dot, background: BLUE, marginLeft: Math.round(dot * 0.45) }} />
        <div style={{ width: dot, height: dot, background: PURPLE, marginLeft: Math.round(dot * 0.45) }} />
      </div>
    </div>
  )
}

function Label({ type, size }: { type: CardArticle['article_type']; size: number }) {
  const info = pieceTypeInfo(type)
  if (!info) return null
  const opinion = info.value === 'opinion'
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          display: 'flex',
          fontSize: size,
          letterSpacing: Math.round(size * 0.14),
          padding: `${Math.round(size * 0.32)}px ${Math.round(size * 0.55)}px ${Math.round(size * 0.22)}px`,
          color: opinion ? BLACK : INK,
          background: opinion ? ORANGE : 'transparent',
          border: `${Math.max(3, Math.round(size * 0.1))}px ${info.value === 'rumor' ? 'dashed' : 'solid'} ${opinion ? ORANGE : INK}`,
        }}
      >
        {info.label.toUpperCase()}
      </div>
    </div>
  )
}

export async function renderShareCard(article: CardArticle, format: ShareFormat, origin: string) {
  const { width, height } = SHARE_FORMATS[format]
  const anton = await readFile(join(process.cwd(), 'app/_fonts/Anton-Regular.ttf'))
  const cover = article.cover_has_text ? null : await loadCover(article.hero_image_url, origin)
  const title = article.title.toUpperCase()

  let body: JSX.Element

  if (format === 'og') {
    // Landscape: text panel left, image right (or type only, full width).
    const panel = cover ? 560 : width
    const pad = 56
    const headlineBox = { w: panel - pad * 2, h: height - pad * 2 - 64 - 92 }
    const size = fitHeadline(title, headlineBox.w, headlineBox.h, cover ? 76 : 96, 34)
    body = (
      <div style={{ display: 'flex', width, height, background: BLACK, borderTop: `12px solid ${ORANGE}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: panel, padding: pad }}>
          <Label type={article.article_type} size={26} />
          <div style={{ display: 'flex', fontSize: size, lineHeight: 0.98, color: INK }}>{title}</div>
          <Wordmark size={52} />
        </div>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={width - panel} height={height - 12} style={{ objectFit: 'cover' }} />
        )}
      </div>
    )
  } else {
    // Portrait and square: image on top at 16:9, black band below.
    const imageH = cover ? Math.round(width * 9 / 16) : 0
    // Instagram Stories cover the top and bottom of the frame with UI, so the
    // story keeps its content inside a safe area.
    const safeTop = format === 'story' ? 220 : 0
    const safeBottom = format === 'story' ? 260 : 0
    const pad = format === 'square' ? 56 : 72
    const labelSize = format === 'square' ? 30 : 36
    const markSize = format === 'square' ? 56 : 68
    const bandH = height - imageH - safeTop - safeBottom
    const headlineBox = { w: width - pad * 2, h: bandH - pad * 2 - labelSize * 2.6 - markSize * 1.6 - 60 }
    const size = fitHeadline(title, headlineBox.w, headlineBox.h, cover ? (format === 'square' ? 120 : 160) : 180, 48)
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', width, height, background: BLACK }}>
        {safeTop > 0 && <div style={{ display: 'flex', height: safeTop, background: BLACK }} />}
        {cover
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={cover} alt="" width={width} height={imageH} style={{ objectFit: 'cover' }} />
          : <div style={{ display: 'flex', height: 14, background: ORANGE }} />}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: pad }}>
          {/* Type only: the headline sits centered rather than under an
              empty band. */}
          {!cover && <div style={{ display: 'flex', flexGrow: 1 }} />}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Label type={article.article_type} size={labelSize} />
            <div style={{ display: 'flex', marginTop: 30, fontSize: size, lineHeight: 0.98, color: INK }}>{title}</div>
          </div>
          <div style={{ display: 'flex', flexGrow: 1 }} />
          <Wordmark size={markSize} />
        </div>
        {safeBottom > 0 && <div style={{ display: 'flex', height: safeBottom, background: BLACK }} />}
      </div>
    )
  }

  return new ImageResponse(body, {
    width,
    height,
    fonts: [{ name: 'Anton', data: anton, style: 'normal', weight: 400 }],
  })
}
