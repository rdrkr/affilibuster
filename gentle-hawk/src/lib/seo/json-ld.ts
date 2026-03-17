// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * JSON-LD Structured Data Builder Module
 *
 * Provides pure functions for building Schema.org JSON-LD structured data objects.
 * Used across pages to generate rich snippets for Google search results.
 * Follows the same pattern as metadata.ts — pure functions, no side effects.
 */

import type { LanguageCode } from '@/lib/generated/types.gen'
import type {
  ArticleJsonLd,
  BreadcrumbItemJsonLd,
  BreadcrumbListJsonLd,
  OrganizationJsonLd,
  ProductJsonLd,
  WebSiteJsonLd,
} from './types'

/** Base URL for the site, used in JSON-LD URL fields. */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * Build Schema.org Organization JSON-LD structured data.
 * @param siteTitle - Organization/site name
 * @param siteUrl - Organization website URL
 * @param logoUrl - Optional organization logo URL
 * @returns Organization JSON-LD object
 */
export function buildOrganizationJsonLd(siteTitle: string, siteUrl: string, logoUrl?: string): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteTitle,
    url: siteUrl,
    ...(logoUrl ? { logo: logoUrl } : {}),
  }
}

/**
 * Build Schema.org WebSite JSON-LD structured data.
 * @param siteName - Name of the website
 * @param baseUrl - Base URL of the website
 * @returns WebSite JSON-LD object
 */
export function buildWebSiteJsonLd(siteName: string, baseUrl: string): WebSiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
  }
}

/**
 * Options for building Product JSON-LD structured data.
 */
interface BuildProductJsonLdOptions {
  /** Product display name (from header label). */
  name: string
  /** Product description text. */
  description?: string
  /** Array of product image URLs. */
  imageUrls?: string[]
  /** Seller/brand name. */
  sellerName?: string
  /** Array of price entries with amount and currency code. */
  prices?: { amount: number; currencyCode: string }[]
  /** Product page URL. */
  url: string
}

/**
 * Build Schema.org Product JSON-LD structured data with Offer pricing.
 * @param options - Product data options
 * @returns Product JSON-LD object
 */
export function buildProductJsonLd(options: BuildProductJsonLdOptions): ProductJsonLd {
  const { name, description, imageUrls, sellerName, prices, url } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...(description ? { description } : {}),
    ...(imageUrls && imageUrls.length > 0 ? { image: imageUrls } : {}),
    ...(sellerName ? { brand: { '@type': 'Brand', name: sellerName } } : {}),
    ...(prices && prices.length > 0
      ? {
          offers: prices.map(price => ({
            '@type': 'Offer' as const,
            price: price.amount.toString(),
            priceCurrency: price.currencyCode,
            availability: 'https://schema.org/InStock',
            url,
          })),
        }
      : {}),
  }
}

/**
 * Options for building Article JSON-LD structured data.
 */
interface BuildArticleJsonLdOptions {
  /** Article headline/title. */
  headline: string
  /** Article description/summary. */
  description?: string
  /** Featured image URL. */
  imageUrl?: string
  /** Author full name. */
  authorName?: string
  /** ISO 8601 date when the article was published. */
  datePublished?: string
  /** ISO 8601 date when the article was last modified. */
  dateModified?: string
  /** Publisher/site name. */
  publisherName?: string
}

/**
 * Build Schema.org Article JSON-LD structured data.
 * @param options - Article data options
 * @returns Article JSON-LD object
 */
export function buildArticleJsonLd(options: BuildArticleJsonLdOptions): ArticleJsonLd {
  const { headline, description, imageUrl, authorName, datePublished, dateModified, publisherName } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(authorName ? { author: { '@type': 'Person', name: authorName } } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(publisherName ? { publisher: { '@type': 'Organization', name: publisherName } } : {}),
  }
}

/**
 * A single breadcrumb entry with a display name and optional path.
 */
export interface BreadcrumbEntry {
  /** Display name for the breadcrumb. */
  name: string
  /** Path relative to the language prefix (e.g., '/products'). Omit for the current/last item. */
  path?: string
}

/**
 * Build Schema.org BreadcrumbList JSON-LD structured data.
 * The last item in the array is treated as the current page (no URL link).
 * @param items - Ordered breadcrumb entries from root to current page
 * @param lang - Current language code for URL construction
 * @returns BreadcrumbList JSON-LD object
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbEntry[], lang: LanguageCode): BreadcrumbListJsonLd {
  const itemListElement: BreadcrumbItemJsonLd[] = items.map((entry, index) => {
    const isLast = index === items.length - 1
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      ...(!isLast && entry.path !== undefined ? { item: `${BASE_URL}/${lang}${entry.path}` } : {}),
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}
