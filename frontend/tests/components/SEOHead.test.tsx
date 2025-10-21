// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for SEOHead component and SEO utilities
 */

import { render } from '@testing-library/react'
import { SEOHead, generateContentMetadata, generateSchemaMarkup } from '@/components/SEOHead'
import { ContentResponse } from '@/types/api'

describe('SEOHead', () => {
  const mockContent: ContentResponse = {
    id: 'content-123',
    type: 'article',
    language: 'en',
    title: 'Test Article',
    slug: 'test-article',
    content: '<p>Test content body</p>',
    excerpt: 'This is a test article excerpt',
    seo: {
      title: 'Test Article - SEO Title',
      description: 'SEO optimized description for testing',
      keywords: ['test', 'article', 'seo'],
    },
    urls: {
      path: '/test-article',
      languagePrefix: '',
      current: 'https://example.com/test-article',
      canonical: 'https://example.com/test-article',
      alternates: {
        it: 'https://example.com/it/test-article',
        he: 'https://example.com/he/test-article',
      },
    },
    status: 'published',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    publishedAt: '2024-01-02T00:00:00Z',
    translations: {
      it: 'articolo-di-prova',
      he: 'test-article-he',
    },
  }

  describe('generateContentMetadata', () => {
    it('should generate basic metadata', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.title).toBe('Test Article - SEO Title')
      expect(metadata.description).toBe('SEO optimized description for testing')
    })

    it('should include keywords', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.keywords).toEqual(['test', 'article', 'seo'])
    })

    it('should include canonical URL', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.alternates?.canonical).toBe('https://example.com/test-article')
    })

    it('should include alternate language URLs', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.alternates?.languages).toEqual({
        it: 'https://example.com/it/test-article',
        he: 'https://example.com/he/test-article',
      })
    })

    it('should generate OpenGraph metadata', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.openGraph).toEqual({
        title: 'Test Article - SEO Title',
        description: 'SEO optimized description for testing',
        url: 'https://example.com/test-article',
        type: 'article',
        locale: 'en',
      })
    })

    it('should generate Twitter metadata', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.twitter).toEqual({
        card: 'summary_large_image',
        title: 'Test Article - SEO Title',
        description: 'SEO optimized description for testing',
      })
    })

    it('should fallback to title when SEO title is missing', () => {
      const contentWithoutSEOTitle = {
        ...mockContent,
        seo: {
          ...mockContent.seo,
          title: undefined,
        },
      }

      const metadata = generateContentMetadata(contentWithoutSEOTitle)

      expect(metadata.title).toBe('Test Article')
      expect(metadata.openGraph?.title).toBe('Test Article')
      expect(metadata.twitter?.title).toBe('Test Article')
    })

    it('should fallback to excerpt when SEO description is missing', () => {
      const contentWithoutSEODescription = {
        ...mockContent,
        seo: {
          ...mockContent.seo,
          description: undefined,
        },
      }

      const metadata = generateContentMetadata(contentWithoutSEODescription)

      expect(metadata.description).toBe('This is a test article excerpt')
      expect(metadata.openGraph?.description).toBe('This is a test article excerpt')
    })

    it('should set OpenGraph type to website for page content', () => {
      const pageContent = {
        ...mockContent,
        type: 'page' as const,
      }

      const metadata = generateContentMetadata(pageContent)

      expect(metadata.openGraph?.type).toBe('website')
    })

    it('should set OpenGraph type to article for article content', () => {
      const metadata = generateContentMetadata(mockContent)

      expect(metadata.openGraph?.type).toBe('article')
    })
  })

  describe('generateSchemaMarkup', () => {
    it('should generate Article schema for article type', () => {
      const schema = generateSchemaMarkup(mockContent)

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'Test Article',
        description: 'This is a test article excerpt',
        url: 'https://example.com/test-article',
        inLanguage: 'en',
        headline: 'Test Article',
        datePublished: '2024-01-02T00:00:00Z',
        dateModified: '2024-01-15T00:00:00Z',
      })
    })

    it('should generate Product schema for product type', () => {
      const productContent = {
        ...mockContent,
        type: 'product' as const,
      }

      const schema = generateSchemaMarkup(productContent)

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test Article',
        description: 'This is a test article excerpt',
        url: 'https://example.com/test-article',
        inLanguage: 'en',
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
        },
      })
    })

    it('should generate Article schema for page type', () => {
      const pageContent = {
        ...mockContent,
        type: 'page' as const,
      }

      const schema = generateSchemaMarkup(pageContent)

      expect(schema['@type']).toBe('Article')
    })

    it('should include language in schema', () => {
      const italianContent = {
        ...mockContent,
        language: 'it',
      }

      const schema = generateSchemaMarkup(italianContent)

      expect(schema.inLanguage).toBe('it')
    })
  })

  describe('SEOHead component', () => {
    it('should render script tag', () => {
      const { container } = render(<SEOHead content={mockContent} />)

      const script = container.querySelector('script')
      expect(script).toBeInTheDocument()
    })

    it('should have correct type attribute', () => {
      const { container } = render(<SEOHead content={mockContent} />)

      const script = container.querySelector('script')
      expect(script).toHaveAttribute('type', 'application/ld+json')
    })

    it('should contain valid JSON-LD', () => {
      const { container } = render(<SEOHead content={mockContent} />)

      const script = container.querySelector('script')
      const jsonContent = script?.textContent || ''
      const parsed = JSON.parse(jsonContent)

      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('Article')
    })

    it('should render Product schema for products', () => {
      const productContent = {
        ...mockContent,
        type: 'product' as const,
      }

      const { container } = render(<SEOHead content={productContent} />)

      const script = container.querySelector('script')
      const jsonContent = script?.textContent || ''
      const parsed = JSON.parse(jsonContent)

      expect(parsed['@type']).toBe('Product')
      expect(parsed.offers).toBeDefined()
    })

    it('should render Article schema with dates', () => {
      const { container } = render(<SEOHead content={mockContent} />)

      const script = container.querySelector('script')
      const jsonContent = script?.textContent || ''
      const parsed = JSON.parse(jsonContent)

      expect(parsed.datePublished).toBe('2024-01-02T00:00:00Z')
      expect(parsed.dateModified).toBe('2024-01-15T00:00:00Z')
    })
  })
})
