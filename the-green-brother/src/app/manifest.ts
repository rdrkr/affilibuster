// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Dynamic web app manifest generator using Next.js metadata file convention.
 *
 * Generates manifest.json with:
 * - Site name and description from CMS navigation data
 * - Standalone display mode for PWA-like experience
 * - Theme colors from the project's design system
 * - Favicon icon reference
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */

import { getNavigation } from '@/lib/content/api'
import type { MetadataRoute } from 'next'

/**
 * Generate the web app manifest for the application.
 * Fetches site name and description from CMS navigation data.
 * @returns Web app manifest object with name, icons, and theme configuration
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const navigation = await getNavigation()

  return {
    name: navigation?.siteTitle ?? 'TheGreenBrother',
    short_name: navigation?.siteTitle ?? 'TheGreenBrother',
    description: navigation?.siteDescription ?? 'Your trusted source for curated sustainable products.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e1e2e',
    theme_color: '#a6e3a1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
