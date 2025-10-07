// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * SEO Head Component
 * Reference: T113 (SEOHead component - hreflang, schema)
 * Generates SEO meta tags, hreflang, and schema markup
 */

import { ContentResponse } from '@/types/api';
import { Metadata } from 'next';

interface SEOHeadProps {
  content: ContentResponse;
}

/**
 * Generate metadata for Next.js 14 App Router
 */
export function generateContentMetadata(content: ContentResponse): Metadata {
  return {
    title: content.seo.title || content.title,
    description: content.seo.description || content.excerpt,
    keywords: content.seo.keywords,
    alternates: {
      canonical: content.urls.canonical,
      languages: content.urls.alternates,
    },
    openGraph: {
      title: content.seo.title || content.title,
      description: content.seo.description || content.excerpt,
      url: content.urls.current,
      type: content.type === 'page' ? 'website' : 'article',
      locale: content.language,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.seo.title || content.title,
      description: content.seo.description || content.excerpt,
    },
  };
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
    url: content.urls.current,
    inLanguage: content.language,
  };

  if (content.type === 'product') {
    return {
      ...baseSchema,
      '@type': 'Product',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
      },
    };
  }

  return {
    ...baseSchema,
    '@type': 'Article',
    headline: content.title,
    datePublished: content.publishedAt,
    dateModified: content.updatedAt,
  };
}

/**
 * SEOHead component for rendering schema markup
 */
export function SEOHead({ content }: SEOHeadProps) {
  const schema = generateSchemaMarkup(content);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
