// Copyright (c) 2025 Affilibuster by Ronen Druker.

/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n.ts'
);

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['10.100.102.35'],
  // Treat ESLint warnings as errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Treat TypeScript errors strictly
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig);
