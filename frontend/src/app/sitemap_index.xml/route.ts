// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Sitemap Index Route
 *
 * Generates a sitemap index that references language-specific sitemaps.
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const LANGUAGES = ['en', 'it', 'he'] as const

/**
 * Generate sitemap index XML.
 *
 * @returns Sitemap index XML response
 */
export function GET() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${LANGUAGES.map(
  lang => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${lang}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
).join('\n')}
</sitemapindex>`

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
