// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for JSON-LD structured data builder functions.
 * Tests buildOrganizationJsonLd, buildWebSiteJsonLd, buildProductJsonLd,
 * buildArticleJsonLd, and buildBreadcrumbJsonLd.
 */

import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/json-ld'
import { LanguageCode } from '@/lib/generated/types.gen'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

describe('buildOrganizationJsonLd', () => {
  it('should build Organization JSON-LD with required fields', () => {
    const result = buildOrganizationJsonLd('TheGreenBrother', 'https://example.com')

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TheGreenBrother',
      url: 'https://example.com',
    })
  })

  it('should include logo when provided', () => {
    const result = buildOrganizationJsonLd('TheGreenBrother', 'https://example.com', 'https://example.com/logo.png')

    expect(result.logo).toBe('https://example.com/logo.png')
  })

  it('should not include logo when not provided', () => {
    const result = buildOrganizationJsonLd('TheGreenBrother', 'https://example.com')

    expect(result).not.toHaveProperty('logo')
  })
})

describe('buildWebSiteJsonLd', () => {
  it('should build WebSite JSON-LD with name and url', () => {
    const result = buildWebSiteJsonLd('TheGreenBrother', 'https://example.com')

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TheGreenBrother',
      url: 'https://example.com',
    })
  })
})

describe('buildProductJsonLd', () => {
  it('should build Product JSON-LD with required name and url', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Eco Water Bottle',
    })
  })

  it('should include description when provided', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      description: 'A sustainable water bottle',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result.description).toBe('A sustainable water bottle')
  })

  it('should not include description when not provided', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).not.toHaveProperty('description')
  })

  it('should include image URLs when provided', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result.image).toEqual(['https://example.com/img1.jpg', 'https://example.com/img2.jpg'])
  })

  it('should not include image when array is empty', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      imageUrls: [],
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).not.toHaveProperty('image')
  })

  it('should not include image when not provided', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).not.toHaveProperty('image')
  })

  it('should include brand from seller name', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      sellerName: 'GreenStore',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result.brand).toEqual({ '@type': 'Brand', name: 'GreenStore' })
  })

  it('should not include brand when seller name not provided', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).not.toHaveProperty('brand')
  })

  it('should include offers from prices', () => {
    const url = 'https://example.com/en/products/eco-water-bottle'
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      prices: [
        { amount: 29.99, currencyCode: 'USD' },
        { amount: 27.5, currencyCode: 'EUR' },
      ],
      url,
    })

    expect(result.offers).toEqual([
      {
        '@type': 'Offer',
        price: '29.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url,
      },
      {
        '@type': 'Offer',
        price: '27.5',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url,
      },
    ])
  })

  it('should not include offers when prices array is empty', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      prices: [],
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).not.toHaveProperty('offers')
  })

  it('should not include offers when prices not provided', () => {
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      url: 'https://example.com/en/products/eco-water-bottle',
    })

    expect(result).not.toHaveProperty('offers')
  })

  it('should build complete Product JSON-LD with all fields', () => {
    const url = 'https://example.com/en/products/eco-water-bottle'
    const result = buildProductJsonLd({
      name: 'Eco Water Bottle',
      description: 'A sustainable water bottle',
      imageUrls: ['https://example.com/img.jpg'],
      sellerName: 'GreenStore',
      prices: [{ amount: 29.99, currencyCode: 'USD' }],
      url,
    })

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Eco Water Bottle',
      description: 'A sustainable water bottle',
      image: ['https://example.com/img.jpg'],
      brand: { '@type': 'Brand', name: 'GreenStore' },
      offers: [
        {
          '@type': 'Offer',
          price: '29.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url,
        },
      ],
    })
  })
})

describe('buildArticleJsonLd', () => {
  it('should build Article JSON-LD with required headline', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Top 10 Eco Products',
    })
  })

  it('should include description when provided', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      description: 'Discover the best eco-friendly products.',
    })

    expect(result.description).toBe('Discover the best eco-friendly products.')
  })

  it('should not include description when not provided', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).not.toHaveProperty('description')
  })

  it('should include image URL when provided', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      imageUrl: 'https://example.com/featured.jpg',
    })

    expect(result.image).toBe('https://example.com/featured.jpg')
  })

  it('should not include image when not provided', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).not.toHaveProperty('image')
  })

  it('should include author when name provided', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      authorName: 'Jane Doe',
    })

    expect(result.author).toEqual({ '@type': 'Person', name: 'Jane Doe' })
  })

  it('should not include author when name not provided', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).not.toHaveProperty('author')
  })

  it('should include datePublished when provided', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      datePublished: '2026-01-15T10:00:00Z',
    })

    expect(result.datePublished).toBe('2026-01-15T10:00:00Z')
  })

  it('should not include datePublished when not provided', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).not.toHaveProperty('datePublished')
  })

  it('should include dateModified when provided', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      dateModified: '2026-02-20T14:30:00Z',
    })

    expect(result.dateModified).toBe('2026-02-20T14:30:00Z')
  })

  it('should not include dateModified when not provided', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).not.toHaveProperty('dateModified')
  })

  it('should include publisher when name provided', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      publisherName: 'TheGreenBrother',
    })

    expect(result.publisher).toEqual({ '@type': 'Organization', name: 'TheGreenBrother' })
  })

  it('should not include publisher when name not provided', () => {
    const result = buildArticleJsonLd({ headline: 'Top 10 Eco Products' })

    expect(result).not.toHaveProperty('publisher')
  })

  it('should build complete Article JSON-LD with all fields', () => {
    const result = buildArticleJsonLd({
      headline: 'Top 10 Eco Products',
      description: 'Discover the best eco-friendly products.',
      imageUrl: 'https://example.com/featured.jpg',
      authorName: 'Jane Doe',
      datePublished: '2026-01-15T10:00:00Z',
      dateModified: '2026-02-20T14:30:00Z',
      publisherName: 'TheGreenBrother',
    })

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Top 10 Eco Products',
      description: 'Discover the best eco-friendly products.',
      image: 'https://example.com/featured.jpg',
      author: { '@type': 'Person', name: 'Jane Doe' },
      datePublished: '2026-01-15T10:00:00Z',
      dateModified: '2026-02-20T14:30:00Z',
      publisher: { '@type': 'Organization', name: 'TheGreenBrother' },
    })
  })
})

describe('buildBreadcrumbJsonLd', () => {
  it('should build BreadcrumbList with single item', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home' }], LanguageCode.EN)

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
        },
      ],
    })
  })

  it('should build BreadcrumbList with multiple items', () => {
    const result = buildBreadcrumbJsonLd(
      [{ name: 'Home', path: '' }, { name: 'Products', path: '/products' }, { name: 'Eco Water Bottle' }],
      LanguageCode.EN
    )

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/en`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${SITE_URL}/en/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Eco Water Bottle',
        },
      ],
    })
  })

  it('should not include item URL on the last breadcrumb', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home', path: '' }, { name: 'Blog' }], LanguageCode.EN)

    const lastItem = result.itemListElement[1]
    expect(lastItem).not.toHaveProperty('item')
  })

  it('should construct URLs with correct language prefix for Italian', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home', path: '' }, { name: 'Prodotti' }], LanguageCode.IT)

    expect(result.itemListElement[0]?.item).toBe(`${SITE_URL}/it`)
  })

  it('should construct URLs with correct language prefix for Hebrew', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home', path: '' }, { name: 'Blog' }], LanguageCode.HE)

    expect(result.itemListElement[0]?.item).toBe(`${SITE_URL}/he`)
  })

  it('should handle breadcrumb without path on non-last item', () => {
    const result = buildBreadcrumbJsonLd([{ name: 'Home' }, { name: 'Products' }], LanguageCode.EN)

    // First item has no path, so no item URL even though it's not last
    expect(result.itemListElement[0]).not.toHaveProperty('item')
    expect(result.itemListElement[1]).not.toHaveProperty('item')
  })

  it('should build BreadcrumbList with blog path structure', () => {
    const result = buildBreadcrumbJsonLd(
      [{ name: 'Home', path: '' }, { name: 'Blog', path: '/blog' }, { name: 'Top 10 Eco Products' }],
      LanguageCode.EN
    )

    expect(result.itemListElement).toHaveLength(3)
    expect(result.itemListElement[0]?.item).toBe(`${SITE_URL}/en`)
    expect(result.itemListElement[1]?.item).toBe(`${SITE_URL}/en/blog`)
    expect(result.itemListElement[2]).not.toHaveProperty('item')
  })
})
