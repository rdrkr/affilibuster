// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Dynamic sitemap generation using Next.js MetadataRoute.Sitemap.
 *
 * Generates sitemap entries for all static and dynamic pages.
 * Note: This basic approach doesn't support xhtml:link alternate tags.
 * Those are handled by the sitemap.xml route handler.
 */

import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const LANGUAGES = ['en', 'it', 'he'] as const

/**
 * Generate sitemap.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  const staticRoutes = [
    { path: '', priority: 1.0, changefreq: 'daily' as const },
    { path: 'products', priority: 0.9, changefreq: 'daily' as const },
    { path: 'about', priority: 0.7, changefreq: 'weekly' as const },
    { path: 'contact', priority: 0.6, changefreq: 'monthly' as const },
    { path: 'privacy', priority: 0.5, changefreq: 'monthly' as const },
    { path: 'terms', priority: 0.5, changefreq: 'monthly' as const },
  ]

  const now = new Date()

  for (const route of staticRoutes) {
    for (const lang of LANGUAGES) {
      const path = route.path ? `/${lang}/${route.path}` : `/${lang}`
      entries.push({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: route.changefreq,
        priority: route.priority,
      })
    }
  }

  // Dynamic product pages
  try {
    const productsResponse = await getProducts({
      locale: 'en',
      'pagination[pageSize]': 100,
    } as Parameters<typeof getProducts>[0])

    if (productsResponse?.data) {
      for (const product of productsResponse.data) {
        if (!product.slug) continue

        for (const lang of LANGUAGES) {
          entries.push({
            url: `${SITE_URL}/${lang}/products/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
            changeFrequency: 'weekly',
            priority: 0.8,
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error)
  }

  return entries
}
