// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { NextConfig } from 'next'
import next_intl from 'next-intl/plugin'

const withNextIntl = next_intl('./src/i18n.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['10.100.102.35'],
  // Treat TypeScript errors strictly
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: process.env.BACKEND_PROTOCOL,
        hostname: process.env.BACKEND_HOST,
        port: process.env.BACKEND_PORT,
        pathname: '/uploads/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
