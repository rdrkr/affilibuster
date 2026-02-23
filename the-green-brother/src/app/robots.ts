// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Dynamic robots.txt generator using Next.js metadata file convention.
 * Generates robots.txt with:
 * - Allow all crawlers to access public pages
 * - Disallow auth pages, profile pages, and style-guide
 * - Reference to the sitemap URL
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next'

/**
 * Base URL for the site, used to construct the sitemap reference.
 * Falls back to the production domain when the env var is not set.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thegreenbrother.com'

/**
 * Generate the robots.txt configuration for the application.
 * @returns Robots configuration with crawl rules and sitemap reference
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/*/login', '/*/signup', '/*/profile/', '/*/style-guide'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
