/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rqbrshlalcscpvdtmxvc.supabase.co',
      },
          {
            protocol: 'https',
            hostname: 'www.reuters.com',
          },
          {
            protocol: 'https',
            hostname: 'preview.redd.it',
          },
          {
            protocol: 'https',
            hostname: 'fadeawayworld.net',
          },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i3.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i4.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'lakersnation.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'platform.silverscreenandroll.com',
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
                // All allowed domains are now in remotePatterns (domains array removed)
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
      'www.reuters.com',
      'preview.redd.it',
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
      'fadeawayworld.net',
    ],
  },
  experimental: {
    taint: true,
  },
}

module.exports = nextConfig
