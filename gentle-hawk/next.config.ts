// Copyright (c) 2026 Affilibuster by Ronen Druker.

import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import next_intl from 'next-intl/plugin'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
const withNextIntl = next_intl('./src/i18n.ts')

/**
 * Get protocol for remotePatterns configuration.
 * @param protocol - Protocol string from environment variable
 * @returns Normalized protocol value
 */
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
  if (port === '443' && protocol === 'https') return ''
  if (port === '80' && protocol === 'http') return ''
  return port
}

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', 'host.docker.internal'],
  typescript: {
    ignoreBuildErrors: false,
  },
  compress: true,
  images: {
    unoptimized: process.env.NEXT_PUBLIC_CMS_URL === process.env.CMS_URL_DEV,
    loader: 'default',
    remotePatterns: [
      {
        protocol: getProtocol(process.env.BACKEND_PROTOCOL),
        hostname: process.env.BACKEND_HOST ?? 'localhost',
        port: getPort(process.env.BACKEND_PORT, process.env.BACKEND_PROTOCOL),
        pathname: '/uploads/**',
      },
      {
        protocol: getProtocol(process.env.CMS_PROTOCOL),
        hostname: process.env.CMS_HOST ?? 'localhost',
        port: getPort(process.env.CMS_PORT, process.env.CMS_PROTOCOL),
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
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
              "connect-src 'self'",
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
  rewrites() {
    return [
      { source: '/:lang/manifest.webmanifest', destination: '/manifest.webmanifest' },
      { source: '/:lang/robots.txt', destination: '/robots.txt' },
      { source: '/:lang/sitemap.xml', destination: '/sitemap.xml' },
    ]
  },
}

export default withBundleAnalyzer(withNextIntl(nextConfig))
