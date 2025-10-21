// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * SEO Head Component
 * Reference: T113 (SEOHead component - hreflang, schema)
 * Generates SEO meta tags, hreflang, and schema markup
 */

import { Metadata } from 'next'

interface SEOHeadProps {
  content: ContentResponse
}

/**
 * Generate metadata for Next.js 14 App Router
 */
export function generateContentMetadata(content: ContentResponse): Metadata {
  return {
    title: content.seo.metaTitle || content.title,
    description: content.seo.metaDescription || content.excerpt,
    keywords: content.seo.metaKeywords,
    alternates: {
      canonical: content.seo.canonicalUrl,
      languages: Object.fromEntries(Object.entries(content.translations).map(([lang, url]) => [lang, url])) as Record<
        string,
        string
      >,
    },
    openGraph: {
      title: content.seo.metaTitle || content.title,
      description: content.seo.metaDescription || content.excerpt,
      url: content.seo.canonicalUrl,
      type: content.type === 'page' ? 'website' : 'article',
      locale: content.languageCode,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.seo.metaTitle || content.title,
      description: content.seo.metaDescription || content.excerpt,
    },
  }
}

/**
 * Generate JSON-LD schema markup
 */
export function generateSchemaMarkup(content: ContentResponse) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': content.type === 'product' ? 'Product' : 'Article',
    name: content.title,
    description: content.excerpt,
    url: content.seo.canonicalUrl,
    inLanguage: content.languageCode,
  }

  if (content.type === 'product') {
    return {
      ...baseSchema,
      '@type': 'Product',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
      },
    }
  }

  return {
    ...baseSchema,
    '@type': 'Article',
    headline: content.title,
    datePublished: content.publishedAt ? new Date(content.publishedAt).toISOString() : undefined,
  }
}

/**
 * SEOHead component for rendering schema markup
 */
export function SEOHead({ content }: SEOHeadProps) {
  const schema = generateSchemaMarkup(content)

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
