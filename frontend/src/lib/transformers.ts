// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Data Transformers
 *
 * Transforms raw API types to application types
 */

import type { Product, ContentResponse } from './types'

/**
 * Transform a Product from the API to ContentResponse format
 * This allows Product data to be used with SEO and content components
 */
export function transformProductToContent(product: Product, lang: string = 'en'): ContentResponse {
  // Build translations map from localizations if available
  const translations: Record<string, string> = {}
  if (product.localizations) {
    for (const loc of product.localizations) {
      if (loc.locale && loc.slug) {
        translations[loc.locale] = `/${loc.locale}/${loc.slug}`
      }
    }
  }

  return {
    id: product.id.toString(),
    type: 'product',
    language: product.locale || lang,
    title: product.title,
    slug: product.slug,
    content: product.content,
    excerpt: product.excerpt,
    seo: {
      title: product.metaTitle || product.title,
      description: product.metaDescription || product.excerpt,
      keywords: Array.isArray(product.metaKeywords) ? (product.metaKeywords as string[]) : undefined,
      canonicalUrl: `/${lang}/${product.slug}`,
    },
    urls: {
      path: `/${product.slug}`,
      languagePrefix: `/${lang}`,
      current: `/${lang}/${product.slug}`,
      canonical: `/${lang}/${product.slug}`,
      alternates: translations,
    },
    status: product.publishedAt ? 'published' : 'draft',
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    publishedAt: product.publishedAt,
    translations,
  }
}
