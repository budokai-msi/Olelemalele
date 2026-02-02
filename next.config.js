/** @type {import('next').NextConfig} */
const nextConfig = {
  // ═══════════════════════════════════════════════════════════════════════════
  // OBFUSCATION & SECURITY HARDENING
  // ═══════════════════════════════════════════════════════════════════════════
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  swcMinify: true,

  transpilePackages: ['locomotive-scroll'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  poweredByHeader: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFORMANCE OPTIMIZATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'printify.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.printify.com', pathname: '/**' },
      { protocol: 'https', hostname: 'gelato.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.gelato.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
  },

  // Experimental performance features
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      'three',
    ],
  },

  // Bundle analyzer in analyze mode
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../analyze/client.html',
          })
        )
      }
      return config
    },
  }),

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/(.*).(jpg|jpeg|png|gif|webp|avif|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache video files with long TTL
      {
        source: '/(.*).(mp4|webm|ogg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache fonts aggressively
      {
        source: '/(.*).(woff|woff2|ttf|otf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache JS/CSS chunks
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache data fetches with stale-while-revalidate for smoother UX
      {
        source: '/_next/data/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=600' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
