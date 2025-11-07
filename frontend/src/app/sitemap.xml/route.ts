// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Main sitemap index
 * Reference: T148A (sitemap index linking to language-specific sitemaps)
 * Dynamically generates sitemap index based on available languages from backend API
 */

import { NextResponse } from 'next/server'
import { getLanguages } from '@/lib/client'

/**
 * Generate sitemap index XML
 * Fetches available languages from backend and creates sitemap entries for each
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://affilibuster.com'
  const lastmod = new Date().toISOString()

  try {
    // Fetch available languages from backend
    const languages = await getLanguages()

    // Generate sitemap entries for each language
    const sitemapEntries = languages
      .map(
        lang => `  <sitemap>
    <loc>${baseUrl}/api/sitemap-${lang.urlPrefix.replace('/', '')}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
      )
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Failed to generate sitemap index:', error)
    return new NextResponse('Failed to generate sitemap index', { status: 500 })
  }
}
