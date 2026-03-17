// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for JSON-LD structured data builder functions.
 * Covers Organization, WebSite, Product, Article, and BreadcrumbList schema generation.
 */

import { LanguageCode } from '@/lib/generated/types.gen'
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/json-ld'

describe('buildOrganizationJsonLd', () => {
  it('builds organization with logo', () => {
    const result = buildOrganizationJsonLd('TestOrg', 'https://test.com', 'https://test.com/logo.png')

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TestOrg',
      url: 'https://test.com',
      logo: 'https://test.com/logo.png',
    })
  })

  it('builds organization without logo', () => {
    const result = buildOrganizationJsonLd('TestOrg', 'https://test.com')

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TestOrg',
      url: 'https://test.com',
    })
    expect(result).not.toHaveProperty('logo')
  })
})

describe('buildWebSiteJsonLd', () => {
  it('builds website JSON-LD', () => {
    const result = buildWebSiteJsonLd('My Site', 'https://mysite.com')

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'My Site',
      url: 'https://mysite.com',
    })
  })
})

describe('buildProductJsonLd', () => {
  it('builds product with all fields', () => {
    const result = buildProductJsonLd({
      name: 'Eco Bottle',
      description: 'A sustainable bottle',
      imageUrls: ['https://test.com/img1.jpg', 'https://test.com/img2.jpg'],
      sellerName: 'EcoBrand',
      prices: [
        { amount: 29.99, currencyCode: 'USD' },
        { amount: 24.99, currencyCode: 'EUR' },
      ],
      url: 'https://test.com/products/eco-bottle',
    })

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('Product')
    expect(result.name).toBe('Eco Bottle')
    expect(result.description).toBe('A sustainable bottle')
    expect(result.image).toEqual(['https://test.com/img1.jpg', 'https://test.com/img2.jpg'])
    expect(result.brand).toEqual({ '@type': 'Brand', name: 'EcoBrand' })
    expect(result.offers).toHaveLength(2)
    expect(result.offers?.[0]).toEqual({
      '@type': 'Offer',
      price: '29.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://test.com/products/eco-bottle',
    })
  })

  it('builds product with minimal fields', () => {
    const result = buildProductJsonLd({
      name: 'Simple Product',
      url: 'https://test.com/products/simple',
    })

    expect(result.name).toBe('Simple Product')
    expect(result).not.toHaveProperty('description')
    expect(result).not.toHaveProperty('image')
    expect(result).not.toHaveProperty('brand')
    expect(result).not.toHaveProperty('offers')
  })

  it('omits image when imageUrls is empty', () => {
    const result = buildProductJsonLd({
      name: 'Product',
      imageUrls: [],
      url: 'https://test.com/products/p',
    })

    expect(result).not.toHaveProperty('image')
  })

  it('omits offers when prices is empty', () => {
    const result = buildProductJsonLd({
      name: 'Product',
      prices: [],
      url: 'https://test.com/products/p',
    })

    expect(result).not.toHaveProperty('offers')
  })
})

describe('buildArticleJsonLd', () => {
  it('builds article with all fields', () => {
    const result = buildArticleJsonLd({
      headline: 'Test Article',
      description: 'Article summary',
      imageUrl: 'https://test.com/article.jpg',
      authorName: 'Jane Doe',
      datePublished: '2026-01-15',
      dateModified: '2026-02-01',
      publisherName: 'TestOrg',
    })

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
      description: 'Article summary',
      image: 'https://test.com/article.jpg',
      author: { '@type': 'Person', name: 'Jane Doe' },
      datePublished: '2026-01-15',
      dateModified: '2026-02-01',
      publisher: { '@type': 'Organization', name: 'TestOrg' },
    })
  })

  it('builds article with only headline', () => {
    const result = buildArticleJsonLd({ headline: 'Minimal Article' })

    expect(result['@type']).toBe('Article')
    expect(result.headline).toBe('Minimal Article')
    expect(result).not.toHaveProperty('description')
    expect(result).not.toHaveProperty('image')
    expect(result).not.toHaveProperty('author')
    expect(result).not.toHaveProperty('datePublished')
    expect(result).not.toHaveProperty('dateModified')
    expect(result).not.toHaveProperty('publisher')
  })
})

describe('buildBreadcrumbJsonLd', () => {
  it('builds breadcrumb list with multiple items', () => {
    const result = buildBreadcrumbJsonLd(
      [{ name: 'Home', path: '' }, { name: 'Products', path: '/products' }, { name: 'Eco Bottle' }],
      LanguageCode.EN
    )

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(3)

    // First item has path
    expect(result.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'http://localhost:3000/en',
    })

    // Middle item has path
    expect(result.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Products',
      item: 'http://localhost:3000/en/products',
    })

    // Last item has no URL
    expect(result.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Eco Bottle',
    })
    expect(result.itemListElement[2]).not.toHaveProperty('item')
  })

  it('builds breadcrumb for different languages', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home', path: '' }, { name: 'Info' }], LanguageCode.HE)

    expect(result.itemListElement[0]?.item).toBe('http://localhost:3000/he')
  })

  it('handles single item breadcrumb', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home' }], LanguageCode.EN)

    expect(result.itemListElement).toHaveLength(1)
    expect(result.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
    })
    expect(result.itemListElement[0]).not.toHaveProperty('item')
  })
})
