/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ESPN image CDNs
      { protocol: "https", hostname: "img.espn.com" },
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "a1.espncdn.com" },
      { protocol: "https", hostname: "a2.espncdn.com" },
      { protocol: "https", hostname: "a3.espncdn.com" },
      { protocol: "https", hostname: "a4.espncdn.com" },

      // YouTube thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },

      // Spreaker podcast CDN
      { protocol: "https", hostname: "d3wo5wojvuv7l.cloudfront.net" },
      { protocol: "https", hostname: "images.spreaker.com" },

      // Google favicons
      { protocol: "https", hostname: "www.google.com" },

      // Added common syndication hosts
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "s.yimg.com" },
      { protocol: "https", hostname: "media.zenfs.com" },
      { protocol: "https", hostname: "cdn.vox-cdn.com" },
      { protocol: "https", hostname: "images.si.com" },
      { protocol: "https", hostname: "static01.nyt.com" },
      { protocol: "https", hostname: "assets1.bleacherreport.net" },
      { protocol: "https", hostname: "cbsistatic.com" },
    ],
  },
};

module.exports = nextConfig;
