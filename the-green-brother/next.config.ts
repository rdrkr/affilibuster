// Copyright (c) 2025 Affilibuster by Ronen Druker.

import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import next_intl from 'next-intl/plugin'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
const withNextIntl = next_intl('./src/i18n.ts')

const getProtocol = (protocol?: string): 'http' | 'https' => {
  return protocol === 'https' ? 'https' : 'http'
}

/**
 * Get port for remotePatterns configuration.
 * Standard ports (443 for HTTPS, 80 for HTTP) should be empty strings.
 * Using the port number would require URLs to include the explicit port.
 * @param port - Port number from environment variable
 * @param protocol - Protocol (http or https) from environment variable
 * @returns Empty string for standard ports, otherwise the port number
 */
const getPort = (port?: string, protocol?: string): string => {
  if (!port) return ''
  // Standard ports should be empty (browser doesn't include them in URLs)
  if (port === '443' && protocol === 'https') return ''
  if (port === '80' && protocol === 'http') return ''
  return port
}

const nextConfig: NextConfig = {
  // Standalone output for production Docker deployment (self-contained server.js with minimal node_modules)
  // Only affects `next build` output, not `next dev`
  output: 'standalone',
  // Monorepo root for standalone output file tracing — ensures Next.js traces
  // dependencies from sibling packages (e.g. @affilibuster/frontend) into the
  // standalone bundle. Points to the parent directory of the project.
  outputFileTracingRoot: new URL('..', import.meta.url).pathname,
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', 'host.docker.internal', 'rdrkr-mbp-m1.local'],
  // Treat TypeScript errors strictly
  typescript: {
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  compress: true, // Enable gzip compression (SWC minification & font optimization are enabled by default)
  images: {
    unoptimized: process.env.NEXT_PUBLIC_CMS_URL === process.env.CMS_URL_DEV,
    loader: 'default',
    remotePatterns: [
      {
        // Backend access
        protocol: getProtocol(process.env.BACKEND_PROTOCOL),
        hostname: process.env.BACKEND_HOST ?? 'localhost',
        port: getPort(process.env.BACKEND_PORT, process.env.BACKEND_PROTOCOL),
        pathname: '/uploads/**',
      },
      {
        // CMS direct access (for images coming directly from CMS storage)
        protocol: getProtocol(process.env.CMS_PROTOCOL),
        hostname: process.env.CMS_HOST ?? 'localhost',
        port: getPort(process.env.CMS_PORT, process.env.CMS_PROTOCOL),
        pathname: '/uploads/**',
      },
      {
        // Cloudinary access (for images coming directly from Cloudinary storage)
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: [
      'react',
      'react-dom',
      'next-intl',
      'react-markdown',
      'rehype-sanitize',
      'remark-gfm',
      'rehype-raw',
    ],
  },
  bundlePagesRouterDependencies: true,
  typedRoutes: false,
  // see issue @ https://github.com/vercel/next.js/discussions/64330#discussioncomment-15140753
  transpilePackages: ['next', '@affilibuster/frontend'],
  turbopack: {
    resolveAlias: {
      '../build/polyfills/polyfill-module': './src/lib/others/modern-polyfill.js',
      'next/dist/build/polyfills/polyfill-module': './src/lib/others/modern-polyfill.js',
      'next/dev/build/polyfills/polyfill-module': './src/lib/others/modern-polyfill.js',
      '.next/dist/build/polyfills/polyfill-module': './src/lib/others/modern-polyfill.js',
      '.next/dev/build/polyfills/polyfill-module': './src/lib/others/modern-polyfill.js',
    },
  },
  // URL redirects for old/changed product slugs
  redirects() {
    return [
      // Old product URLs redirect to new ones with 301 Permanent
      {
        source: '/products/old-product-slug',
        destination: '/en/products/eco-water-bottle',
        permanent: true,
      },
      {
        source: '/products/old-slug-1',
        destination: '/en/products/product-1',
        permanent: true,
      },
      {
        source: '/products/old-slug-2',
        destination: '/en/products/product-2',
        permanent: true,
      },
      {
        source: '/products/old-slug-3',
        destination: '/en/products/product-3',
        permanent: true,
      },
    ]
  },
  // Cache-Control headers for static assets and security headers
  headers() {
    return [
      {
        source: '/(images|icons)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "object-src 'none'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com",
              "connect-src 'self' https://*.thegreenbrother.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "require-trusted-types-for 'script'",
              'trusted-types default',
            ].join('; '),
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
  // Serve metadata files under locale prefixes (e.g. /en/robots.txt → /robots.txt)
  rewrites() {
    return [
      { source: '/:lang/manifest.webmanifest', destination: '/manifest.webmanifest' },
      { source: '/:lang/robots.txt', destination: '/robots.txt' },
      { source: '/:lang/sitemap.xml', destination: '/sitemap.xml' },
    ]
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
