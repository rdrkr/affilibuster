// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * SEO Head Component
 * Reference: T113 (SEOHead component - hreflang, schema)
 * Generates SEO meta tags, hreflang, and schema markup
 */

import type { Metadata } from 'next'
import type { ContentResponse } from '@/lib/types'
import { ContentType } from '@/lib/types'

interface SEOHeadProps {
  content: ContentResponse
}

/**
 * Generate metadata for Next.js 14 App Router
 */
export function generateContentMetadata(content: ContentResponse): Metadata {
  return {
    title: content.seo.title ?? content.title,
    description: content.seo.description ?? content.excerpt,
    keywords: content.seo.keywords,
    alternates: {
      canonical: content.seo.canonicalUrl,
      languages: content.urls.alternates,
    },
    openGraph: {
      title: content.seo.title ?? content.title,
      description: content.seo.description ?? content.excerpt,
      url: content.seo.canonicalUrl,
      type: content.type === ContentType.PAGE ? 'website' : 'article',
      locale: content.language,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.seo.title ?? content.title,
      description: content.seo.description ?? content.excerpt,
    },
  }
}

/**
 * Generate JSON-LD schema markup for content pages
 */
export function generateSchemaMarkup(content: ContentResponse) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': content.type === ContentType.PRODUCT ? 'Product' : 'Article',
    name: content.title,
    description: content.excerpt,
    url: content.seo.canonicalUrl,
    inLanguage: content.language,
  }

  if (content.type === ContentType.PRODUCT) {
    return {
      ...baseSchema,
      '@type': 'Product',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        price: '99.99', // TODO: Get from product data
        priceCurrency: 'USD', // TODO: Get from user preferences
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
 * Generate Organization schema for homepage
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Affilibuster',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  }
}

/**
 * SEOHead component for rendering schema markup
 */
export function SEOHead({ content }: SEOHeadProps) {
  const schema = generateSchemaMarkup(content)

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
