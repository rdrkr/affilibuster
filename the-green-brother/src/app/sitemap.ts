// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Dynamic sitemap generator using Next.js metadata file convention.
 *
 * Generates a sitemap.xml with:
 * - Static pages (homepage, about, contact, blog, products, privacy, terms, cookie-policy)
 * - Dynamic product pages from CMS
 * - Dynamic product category pages from CMS
 * - Dynamic blog post pages from CMS
 * - Localized alternates (xhtml:link hreflang) for all supported languages
 *
 * Auth pages (login, signup), profile pages, and style-guide are excluded.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { getBlogPosts, getProductCategories, getProducts } from '@/lib/content/api'
import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import type { MetadataRoute } from 'next'

/**
 * Base URL for the site, used to construct absolute URLs.
 * Falls back to the production domain when the env var is not set.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thegreenbrother.com'

/**
 * Static page paths that should appear in the sitemap.
 * Each entry includes the path, change frequency, and priority.
 */
const STATIC_PAGES: readonly {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.7 },
  { path: '/products', changeFrequency: 'daily', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookie-policy', changeFrequency: 'yearly', priority: 0.3 },
]

/**
 * Build language alternates object for a given path.
 * Produces an entry for each supported language code.
 * @param path - The page path (e.g., '/about' or '/products/eco-bottle')
 * @returns Language alternates mapping for the sitemap entry
 */
function buildAlternates(path: string): MetadataRoute.Sitemap[number]['alternates'] {
  const languages: Record<string, string> = {}
  for (const lang of SUPPORTED_LANGUAGE_CODES) {
    languages[lang] = `${BASE_URL}/${lang}${path}`
  }
  return { languages }
}

/**
 * Generate the sitemap for the application.
 * Fetches dynamic content from the CMS and combines with static pages.
 * @returns Array of sitemap entries with URLs, metadata, and language alternates
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const defaultLang = LanguageCode.EN

  // Fetch dynamic content from CMS
  const [products, categories, blogPostsResponse] = await Promise.all([
    getProducts({ locale: defaultLang }),
    getProductCategories({ locale: defaultLang }),
    getBlogPosts({ locale: defaultLang }),
  ])

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
    url: `${BASE_URL}/${defaultLang}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: buildAlternates(page.path),
  }))

  // Dynamic product pages
  const productEntries: MetadataRoute.Sitemap = (products ?? []).map(product => ({
    url: `${BASE_URL}/${defaultLang}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: buildAlternates(`/products/${product.slug}`),
  }))

  // Dynamic product category pages
  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map(category => ({
    url: `${BASE_URL}/${defaultLang}/products/category/${category.slug}`,
    lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: buildAlternates(`/products/category/${category.slug}`),
  }))

  // Dynamic blog post pages
  const blogPosts = blogPostsResponse?.data ?? []
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${BASE_URL}/${defaultLang}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    alternates: buildAlternates(`/blog/${post.slug}`),
  }))

  return [...staticEntries, ...productEntries, ...categoryEntries, ...blogEntries]
}
