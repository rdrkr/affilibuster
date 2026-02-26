// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for JsonLdScript server component.
 * Tests JSON-LD structured data rendering in script tags.
 */

import JsonLdScript from '@/components/seo/JsonLdScript'
import { render } from '@testing-library/react'

describe('JsonLdScript', () => {
  it('should render a script tag with type application/ld+json', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TestOrg',
    }

    const { container } = render(<JsonLdScript data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
  })

  it('should serialize data as JSON in script content', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TestSite',
      url: 'https://example.com',
    }

    const { container } = render(<JsonLdScript data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script?.innerHTML).toBe(JSON.stringify(data))
  })

  it('should render Product JSON-LD with nested objects', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Eco Bottle',
      brand: { '@type': 'Brand', name: 'GreenStore' },
      offers: [{ '@type': 'Offer', price: '29.99', priceCurrency: 'USD' }],
    }

    const { container } = render(<JsonLdScript data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const parsed = JSON.parse(script?.innerHTML ?? '{}')

    expect(parsed['@type']).toBe('Product')
    expect(parsed.brand.name).toBe('GreenStore')
    expect(parsed.offers[0].price).toBe('29.99')
  })

  it('should return null when data is empty object', () => {
    const { container } = render(<JsonLdScript data={{}} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).not.toBeInTheDocument()
  })

  it('should render valid JSON-LD for Article schema', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
      author: { '@type': 'Person', name: 'Jane Doe' },
      datePublished: '2026-01-15T10:00:00Z',
    }

    const { container } = render(<JsonLdScript data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const parsed = JSON.parse(script?.innerHTML ?? '{}')

    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('Article')
    expect(parsed.headline).toBe('Test Article')
    expect(parsed.author.name).toBe('Jane Doe')
  })

  it('should render BreadcrumbList JSON-LD with multiple items', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/en' },
        { '@type': 'ListItem', position: 2, name: 'Products' },
      ],
    }

    const { container } = render(<JsonLdScript data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const parsed = JSON.parse(script?.innerHTML ?? '{}')

    expect(parsed.itemListElement).toHaveLength(2)
    expect(parsed.itemListElement[0].item).toBe('https://example.com/en')
    expect(parsed.itemListElement[1]).not.toHaveProperty('item')
  })
})
