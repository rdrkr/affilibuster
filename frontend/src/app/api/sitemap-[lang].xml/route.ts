// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Sitemap generation API route
 * Reference: T148, T148A (Language-specific sitemaps)
 * research.md:186-188 (sitemap-en.xml, sitemap-it.xml, sitemap-il.xml)
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/client'
import { SUPPORTED_LANGUAGE_CODES, isLanguageCode, LanguageCode } from '@/lib/types'

interface SitemapURL {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * Fetch product content from backend API for sitemap generation
 *
 * @param lang - The language code for which to fetch products
 * @returns Array of product data for the specified language
 */
async function fetchProductsForLanguage(lang: LanguageCode): Promise<unknown[]> {
  try {
    // Fetch products for the specified language
    // Fetch up to 1000 products (1000 products per page, page 1)
    const products = await getProducts({
      'pagination[page]': 1,
      'pagination[pageSize]': 1000,
    } as Parameters<typeof getProducts>[0])

    return Array.isArray(products) ? products : []
  } catch (error) {
    console.error(`Error fetching products for ${lang}:`, error)
    return []
  }
}

/**
 * Generate sitemap XML for a specific language
 */
function generateSitemapXML(urls: SitemapURL[]): string {
  const urlEntries = urls
    .map(url => {
      let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`

      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`
      }

      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`
      }

      if (url.priority !== undefined) {
        entry += `\n    <priority>${url.priority.toString()}</priority>`
      }

      entry += `\n  </url>`
      return entry
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * GET handler for language-specific sitemaps
 * Routes: /api/sitemap-en.xml, /api/sitemap-it.xml, /api/sitemap-il.xml
 *
 * @param request - The Next.js request object
 * @param context - The route context with params
 * @returns XML sitemap response or error
 */
export async function GET(request: NextRequest, context: { params: Promise<{ lang: string }> }) {
  try {
    // Next.js 15: params is now a Promise
    const { lang: langParam } = await context.params
    const urlLang = langParam.replace('.xml', '') // Extract lang from filename
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://affilibuster.com'

    // Valid URL languages include 'il' as an alias for 'he'
    const validUrlLangs = [...SUPPORTED_LANGUAGE_CODES, 'il'] as const
    if (!validUrlLangs.includes(urlLang as (typeof validUrlLangs)[number])) {
      return new NextResponse('Invalid language', { status: 404 })
    }

    // Map 'il' to 'he' for API calls (il is URL prefix, he is language code)
    const apiLang: LanguageCode = urlLang === 'il' ? LanguageCode.HE : (urlLang as LanguageCode)

    // Validate the API language code
    if (!isLanguageCode(apiLang)) {
      return new NextResponse('Invalid language', { status: 404 })
    }

    // Fetch products from backend
    const content = await fetchProductsForLanguage(apiLang)

    // Build sitemap URLs
    const urls: SitemapURL[] = []

    // Add homepage
    const homePath = (urlLang as LanguageCode) === LanguageCode.EN ? '/' : `/${urlLang}`
    urls.push({
      loc: `${baseUrl}${homePath}`,
      changefreq: 'daily',
      priority: 1.0,
    })

    // Add static pages
    const staticPages = ['about', 'contact', 'privacy', 'terms']
    for (const page of staticPages) {
      const pagePath = (urlLang as LanguageCode) === LanguageCode.EN ? `/${page}` : `/${urlLang}/${page}`
      urls.push({
        loc: `${baseUrl}${pagePath}`,
        changefreq: 'monthly',
        priority: 0.8,
      })
    }

    // Add product pages
    for (const item of content) {
      // Construct URL from product item
      const itemSlug = String((item as Record<string, unknown>).slug)
      if (!itemSlug) continue // Skip items without slug

      const path =
        (urlLang as LanguageCode) === LanguageCode.EN ? `/products/${itemSlug}` : `/${urlLang}/products/${itemSlug}`

      const itemRecord = item as Record<string, unknown>
      const updatedAt = itemRecord.updatedAt
      urls.push({
        loc: `${baseUrl}${path}`,
        lastmod: updatedAt != null && typeof updatedAt === 'string' ? updatedAt : '',
        changefreq: 'monthly',
        priority: 0.6,
      })
    }

    // Generate XML
    const xml = generateSitemapXML(urls)

    // Return XML response
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
