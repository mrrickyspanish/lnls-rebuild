/**
 * Responsive covers through Next's image optimizer (/_next/image), which
 * resizes and re-encodes (WebP/AVIF) per screen. Covers are uploaded at up
 * to 2400px, and the home page used to load every one at full size.
 *
 * Only for hosts the optimizer is allowed to fetch (next.config.js
 * remotePatterns): our own /uploads and Supabase storage. Anything else is
 * returned as-is, so an image from an unlisted host still shows.
 * Widths must be in Next's default deviceSizes (640, 1080, 1920 are).
 */
const OPTIMIZABLE_HOSTS = new Set(['rqbrshlalcscpvdtmxvc.supabase.co'])
const WIDTHS = [640, 1080, 1920] as const

function canOptimize(src: string) {
  if (src.startsWith('/') && !src.startsWith('//')) return true
  try {
    const url = new URL(src)
    return url.protocol === 'https:' && OPTIMIZABLE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export function optimizedSrc(src: string, width: (typeof WIDTHS)[number] = 1080) {
  return canOptimize(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75` : src
}

/** src, srcSet and sizes for an <img>; `sizes` describes the rendered width. */
export function responsiveImage(src: string, sizes: string) {
  if (!canOptimize(src)) return { src }
  return {
    src: optimizedSrc(src, 1080),
    srcSet: WIDTHS.map((w) => `${optimizedSrc(src, w)} ${w}w`).join(', '),
    sizes,
  }
}
