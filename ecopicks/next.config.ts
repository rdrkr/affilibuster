// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { NextConfig } from 'next'
import next_intl from 'next-intl/plugin'

const withNextIntl = next_intl('./src/i18n.ts')

const getProtocol = (protocol?: string): 'http' | 'https' => {
  return protocol === 'https' ? 'https' : 'http'
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', '10.100.102.35', 'host.docker.internal'],
  // Treat TypeScript errors strictly
  typescript: {
    ignoreBuildErrors: false,
  },
  // Performance optimizations
  compress: true, // Enable gzip compression (SWC minification & font optimization are enabled by default)
  images: {
    remotePatterns: [
      {
        protocol: getProtocol(process.env.BACKEND_PROTOCOL),
        hostname: process.env.BACKEND_HOST ?? 'localhost',
        port: process.env.BACKEND_PORT ?? '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Use modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
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
}

export default withNextIntl(nextConfig)
