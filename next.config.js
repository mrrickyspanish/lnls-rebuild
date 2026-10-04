/** @type {import('next').NextConfig} */

/**
 * Image hosts.
 *
 * This list previously existed twice: a `remotePatterns` array and a legacy
 * `domains` array. They disagreed (a2/a3.espncdn.com were allowed only by
 * `domains`), and `domains` is deprecated and removed in Next 16, so those two
 * hosts were going to start 400ing on the next major. One list now, with
 * wildcards where a provider uses numbered shards, and the placeholder host
 * `d1234567890123.cloudfront.net` dropped.
 */
const remotePatterns = [
  // YouTube thumbnails (i, i1-i4)
  { protocol: 'https', hostname: '**.ytimg.com' },
  { protocol: 'https', hostname: 'img.youtube.com' },

  // ESPN (a, a1-a3, and the bare apex)
  { protocol: 'https', hostname: '**.espncdn.com' },
  { protocol: 'https', hostname: 'espncdn.com' },

  // Podcast hosting
  { protocol: 'https', hostname: 'images.spreaker.com' },
  { protocol: 'https', hostname: 'spreaker-app.com' },
  { protocol: 'https', hostname: 'd3wo5wojvuv7l.cloudfront.net' },
  { protocol: 'https', hostname: 'd2p3bygnnzw9w3.cloudfront.net' },

  // Supabase storage
  { protocol: 'https', hostname: 'rqbrshlalcscpvdtmxvc.supabase.co' },

  // Editorial and wire sources
  { protocol: 'https', hostname: 'www.reuters.com' },
  { protocol: 'https', hostname: 'preview.redd.it' },
  { protocol: 'https', hostname: 'fadeawayworld.net' },
  { protocol: 'https', hostname: 'www.basketballforever.com' },
  { protocol: 'https', hostname: 'lakersnation.com' },
  { protocol: 'https', hostname: 'cdn.vox-cdn.com' },
  { protocol: 'https', hostname: 'platform.silverscreenandroll.com' },
  { protocol: 'https', hostname: 'cdn1.nbaanalysis.net' },
  { protocol: 'https', hostname: 'cdn.nba.com' },
  { protocol: 'https', hostname: 'ak-static.cms.nba.com' },
  { protocol: 'https', hostname: 'gsp-image-cdn.wmsports.io' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'pbs.twimg.com' },
  { protocol: 'https', hostname: 'media.gettyimages.com' },
]

const nextConfig = {
  images: { remotePatterns },
  experimental: {
    taint: true,
  },
}

module.exports = nextConfig
