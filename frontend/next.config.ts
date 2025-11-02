// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { NextConfig } from 'next'
import next_intl from 'next-intl/plugin'

const withNextIntl = next_intl('./src/i18n.ts')

const getProtocol = (protocol?: string): 'http' | 'https' => {
  return protocol === 'https' ? 'https' : 'http'
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['localhost', '127.0.0.1', '10.100.102.35'],
  // Treat TypeScript errors strictly
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: getProtocol(process.env.BACKEND_PROTOCOL),
        hostname: process.env.BACKEND_HOST || 'localhost',
        port: process.env.BACKEND_PORT || '8000',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
