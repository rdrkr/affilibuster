// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * English Sitemap Route
 *
 * Generates sitemap for English content with xhtml:link alternate tags.
 * Reference: https://developers.google.com/search/docs/specialty/international/localized-versions
 */

import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const LANGUAGES = ['en', 'it', 'he'] as const
const LANG = 'en'

/**
 * Generate alternate language links for a URL.
 *
 * @param path - The URL path
 * @returns XML string with xhtml:link alternates
 */
function generateAlternates(path: string): string {
  return (
    LANGUAGES.map(
      altLang => `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${SITE_URL}/${altLang}${path}" />`
    ).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${path}" />`
  )
}

/**
 * Generate English sitemap XML.
 *
 * @returns Sitemap XML response
 */
export async function GET() {
  // Static pages for this language
  const staticRoutes = [
    { path: '', priority: 1.0, changefreq: 'daily' as const },
    { path: 'products', priority: 0.9, changefreq: 'daily' as const },
    { path: 'about', priority: 0.7, changefreq: 'weekly' as const },
    { path: 'contact', priority: 0.6, changefreq: 'monthly' as const },
  ]

  // Fetch products for this language
  let products: { slug?: string; updatedAt?: string }[] = []
  try {
    const productsResponse = await getProducts({
      locale: LANG,
      'pagination[pageSize]': 100,
    } as Parameters<typeof getProducts>[0])

    if (productsResponse?.data) {
      products = productsResponse.data
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error)
  }

  const now = new Date().toISOString()

  const urlEntries = [
    // Static pages
    ...staticRoutes.map(route => {
      const path = route.path ? `/${route.path}` : ''
      return `  <url>
    <loc>${SITE_URL}/${LANG}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${String(route.priority)}</priority>
${generateAlternates(path)}
  </url>`
    }),

    // Product pages
    ...products
      .map(product => {
        if (!product.slug) return ''
        const path = `/products/${product.slug}`
        return `  <url>
    <loc>${SITE_URL}/${LANG}${path}</loc>
    <lastmod>${product.updatedAt ?? now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${generateAlternates(path)}
  </url>`
      })
      .filter(Boolean),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
