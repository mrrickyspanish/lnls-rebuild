const TRUSTED_IMAGE_HOSTS = new Set([
  'i.ytimg.com',
  'i1.ytimg.com',
  'i2.ytimg.com',
  'i3.ytimg.com',
  'i4.ytimg.com',
  'lakersnation.com',
  'cdn.vox-cdn.com',
  'platform.silverscreenandroll.com',
  'img.youtube.com',
  'a.espncdn.com',
  'a1.espncdn.com',
  'a2.espncdn.com',
  'a3.espncdn.com',
  'espncdn.com',
  'www.thesportingtribune.com',
  'images.gmanews.tv',
  'cdn.nba.com',
  'ak-static.cms.nba.com',
  'images.unsplash.com',
  'pbs.twimg.com',
  'media.gettyimages.com',
  'd2p3bygnnzw9w3.cloudfront.net',
  'spreaker-app.com',
  'images.spreaker.com',
  'd3wo5wojvuv7l.cloudfront.net',
  'd1234567890123.cloudfront.net',
  'www.basketballforever.com',
]);

export function canUseNextImage(src?: string | null) {
  if (!src) return false;
  // Only allow next/image for local images, unsplash, or sanity CDN
  // For external images, fall back to plain <img> to avoid Next.js domain whitelist issues
  return src.startsWith('/') || src.startsWith('https://images.unsplash.com') || src.startsWith('https://cdn.sanity.io');
}

export function isLocalImage(src?: string | null) {
  return Boolean(src && src.startsWith('/'));
}
