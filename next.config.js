/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a1.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a2.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a3.espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'espncdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.nba.com',
      },
      {
        protocol: 'https',
        hostname: 'ak-static.cms.nba.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'media.gettyimages.com',
      },
      {
        protocol: 'https',
        hostname: 'd2p3bygnnzw9w3.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'spreaker-app.com',
      },
      {
        protocol: 'https',
        hostname: 'images.spreaker.com',
      },
      {
        protocol: 'https',
        hostname: 'd3wo5wojvuv7l.cloudfront.net',
      },
      // Add more specific CloudFront domains if needed
      {
        protocol: 'https',
        hostname: 'd1234567890123.cloudfront.net',
      },
    ],
    // Add legacy domains configuration as fallback
    domains: [
      'cdn.sanity.io',
      'i.ytimg.com', 
      'img.youtube.com',
      'images.spreaker.com',
      'd3wo5wojvuv7l.cloudfront.net',
      'spreaker-app.com',
      'a.espncdn.com',
      'a1.espncdn.com',
      'a2.espncdn.com',
      'a3.espncdn.com',
      'espncdn.com',
    ],
  },
  experimental: {
    taint: true,
  },
}

module.exports = nextConfig
