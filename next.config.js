/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ← allows ALL external images (safe in dev + production)
      },
    ],
  },
  experimental: {
    taint: true,
  },
}

module.exports = nextConfig
