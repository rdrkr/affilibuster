// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Data Transformers
 *
 * Transforms raw API types to application types
 */

import type { Product, ContentResponse, LanguageCode } from './types'
import { DEFAULT_LANGUAGE_CODE, ContentType } from './types'

/**
 * Transform a Product from the API to ContentResponse format
 * This allows Product data to be used with SEO and content components
 *
 * @param product - The product to transform
 * @param lang - The language code for the product
 * @returns The product transformed to ContentResponse format
 */
export function transformProductToContent(
  product: Product,
  lang: LanguageCode = DEFAULT_LANGUAGE_CODE
): ContentResponse {
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
    type: ContentType.PRODUCT,
    language: product.locale ?? lang,
    title: product.title,
    slug: product.slug,
    content: product.content,
    ...(product.excerpt && { excerpt: product.excerpt }),
    seo: {
      title: product.metaTitle ?? product.title,
      ...(product.metaDescription || product.excerpt
        ? { description: product.metaDescription ?? product.excerpt }
        : {}),
      ...(Array.isArray(product.metaKeywords) ? { keywords: product.metaKeywords as string[] } : {}),
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
    createdAt: product.createdAt ?? new Date().toISOString(),
    updatedAt: product.updatedAt ?? new Date().toISOString(),
    publishedAt: product.publishedAt,
    translations,
  }
}
