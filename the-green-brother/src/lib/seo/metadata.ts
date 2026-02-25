// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * SEO Metadata Utility Module
 *
 * Provides reusable helper functions for building Next.js Metadata objects
 * from CMS seoMetadata fields. Used across all pages to ensure consistent
 * SEO metadata generation including title, description, OG, Twitter,
 * canonical URLs, and hreflang alternates.
 */

import type { ElementsSeoMetadataEntry } from '@/lib/generated/types.gen'
import { LanguageCode } from '@/lib/generated/types.gen'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import type { Metadata } from 'next'

/** Base URL for the site, used in canonical and alternate URLs. */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/** Map of language codes to OpenGraph locale strings. */
const LOCALE_MAP: Record<LanguageCode, string> = {
  [LanguageCode.EN]: 'en_US',
  [LanguageCode.IT]: 'it_IT',
  [LanguageCode.HE]: 'he_IL',
}

/**
 * Options for building full page metadata.
 */
interface BuildPageMetadataOptions {
  /** CMS seoMetadata entry with metaTitle, metaDescription, metaKeywords. */
  seoMetadata: ElementsSeoMetadataEntry | undefined
  /** Current language code. */
  lang: LanguageCode
  /** Page path relative to the language prefix (e.g., '/about', '/products/eco-bottle'). */
  path: string
  /** Site name from navigation, used in OG tags. */
  siteName?: string | undefined
  /** OpenGraph type, defaults to 'website'. */
  ogType?: 'website' | 'article' | undefined
  /** URL for the OG image (e.g., product image or blog featured image). */
  ogImageUrl?: string | undefined
  /** Whether to set noindex/nofollow robots directive. */
  noIndex?: boolean | undefined
}

/**
 * Options for building noindex page metadata.
 */
interface BuildNoIndexMetadataOptions {
  /** Page title. */
  title?: string | undefined
  /** Page description. */
  description?: string | undefined
}

/**
 * Construct an absolute canonical URL for a given language and path.
 * @param lang - Language code
 * @param path - Page path (e.g., '', '/about', '/products/eco-bottle')
 * @returns Absolute canonical URL string
 */
export function buildCanonicalUrl(lang: LanguageCode, path: string): string {
  return `${BASE_URL}/${lang}${path}`
}

/**
 * Build the alternates object with canonical URL and hreflang language alternates.
 * Includes all supported languages plus x-default pointing to English.
 * @param lang - Current language code for canonical
 * @param path - Page path relative to the language prefix
 * @returns Metadata alternates object with canonical and languages
 */
export function buildAlternates(lang: LanguageCode, path: string): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}

  for (const code of SUPPORTED_LANGUAGE_CODES) {
    languages[code] = buildCanonicalUrl(code, path)
  }
  languages['x-default'] = buildCanonicalUrl(LanguageCode.EN, path)

  return {
    canonical: buildCanonicalUrl(lang, path),
    languages,
  }
}

/**
 * Build a complete Next.js Metadata object from CMS seoMetadata and page context.
 * Includes title, description, keywords, alternates, openGraph, and twitter cards.
 * @param options - Page metadata options including CMS data, language, and path
 * @returns Next.js Metadata object
 */
export function buildPageMetadata(options: BuildPageMetadataOptions): Metadata {
  const { seoMetadata, lang, path, siteName, ogType = 'website', ogImageUrl, noIndex } = options

  const title = seoMetadata?.metaTitle
  const description = seoMetadata?.metaDescription
  const keywords = Array.isArray(seoMetadata?.metaKeywords) ? (seoMetadata.metaKeywords as string[]) : undefined
  const canonicalUrl = buildCanonicalUrl(lang, path)

  return {
    title,
    description,
    keywords,
    alternates: buildAlternates(lang, path),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: LOCALE_MAP[lang],
      type: ogType,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

/**
 * Build simplified metadata for pages that should not be indexed (login, signup, profile).
 * Sets noindex/nofollow and omits alternates, OG, and twitter cards.
 * @param options - Title and description for the page
 * @returns Next.js Metadata object with noindex robots directive
 */
export function buildNoIndexMetadata(options: BuildNoIndexMetadataOptions): Metadata {
  return {
    title: options.title,
    description: options.description,
    robots: { index: false, follow: false },
  }
}
