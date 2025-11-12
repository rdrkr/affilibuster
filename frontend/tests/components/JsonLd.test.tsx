// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for JsonLd component
 */
import { render } from '@testing-library/react'
import { JsonLd } from '@/components/JsonLd'

describe('JsonLd', () => {
  const mockSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Test Organization',
    url: 'https://example.com',
  }

  beforeEach(() => {
    // Clean up any existing scripts
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
      el.remove()
    })
  })

  afterEach(() => {
    // Clean up after each test
    document.head.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
      el.remove()
    })
  })

  it('should inject script into document head', () => {
    render(<JsonLd data={mockSchema} />)

    const script = document.head.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
  })

  it('should have correct type attribute', () => {
    render(<JsonLd data={mockSchema} />)

    const script = document.head.querySelector('script[type="application/ld+json"]')
    expect(script).toHaveAttribute('type', 'application/ld+json')
  })

  it('should contain valid JSON-LD data', () => {
    render(<JsonLd data={mockSchema} />)

    const script = document.head.querySelector('script[type="application/ld+json"]')
    const jsonContent = script?.textContent ?? ''
    const parsed = JSON.parse(jsonContent) as Record<string, unknown>

    expect(parsed).toEqual(mockSchema)
  })

  it('should use custom id when provided', () => {
    render(<JsonLd data={mockSchema} id="custom-schema" />)

    const script = document.getElementById('custom-schema')
    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('type', 'application/ld+json')
  })

  it('should use default id when not provided', () => {
    render(<JsonLd data={mockSchema} />)

    const script = document.getElementById('json-ld-script')
    expect(script).toBeInTheDocument()
  })

  it('should remove existing script with same id before adding new one', () => {
    const { rerender } = render(<JsonLd data={mockSchema} id="test-schema" />)

    const firstScript = document.getElementById('test-schema')
    expect(firstScript).toBeInTheDocument()

    const newSchema = { '@type': 'Product', name: 'New Product' }
    rerender(<JsonLd data={newSchema} id="test-schema" />)

    const scripts = document.querySelectorAll('#test-schema')
    expect(scripts.length).toBe(1)

    const updatedScript = document.getElementById('test-schema')
    const jsonContent = updatedScript?.textContent ?? ''
    const parsed = JSON.parse(jsonContent) as Record<string, unknown>
    expect(parsed).toEqual(newSchema)
  })

  it('should clean up script on unmount', () => {
    const { unmount } = render(<JsonLd data={mockSchema} id="cleanup-test" />)

    expect(document.getElementById('cleanup-test')).toBeInTheDocument()

    unmount()

    expect(document.getElementById('cleanup-test')).not.toBeInTheDocument()
  })

  it('should return null (no visible render)', () => {
    const { container } = render(<JsonLd data={mockSchema} />)

    // Component should not render any visible elements
    expect(container.firstChild).toBeNull()
  })

  it('should update script when data changes', () => {
    const { rerender } = render(<JsonLd data={mockSchema} />)

    const initialScript = document.head.querySelector('script[type="application/ld+json"]')
    const initialContent = initialScript?.textContent ?? ''
    const initialParsed = JSON.parse(initialContent) as Record<string, unknown>
    expect(initialParsed['@type']).toBe('Organization')

    const newSchema = { '@context': 'https://schema.org', '@type': 'Product', name: 'Test Product' }
    rerender(<JsonLd data={newSchema} />)

    const updatedScript = document.head.querySelector('script[type="application/ld+json"]')
    const updatedContent = updatedScript?.textContent ?? ''
    const updatedParsed = JSON.parse(updatedContent) as Record<string, unknown>
    expect(updatedParsed['@type']).toBe('Product')
  })

  it('should update script when id changes', () => {
    const { rerender } = render(<JsonLd data={mockSchema} id="schema-1" />)

    expect(document.getElementById('schema-1')).toBeInTheDocument()

    rerender(<JsonLd data={mockSchema} id="schema-2" />)

    expect(document.getElementById('schema-1')).not.toBeInTheDocument()
    expect(document.getElementById('schema-2')).toBeInTheDocument()
  })

  it('should handle complex nested data structures', () => {
    const complexSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Complex Product',
      offers: {
        '@type': 'Offer',
        price: '99.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '100',
      },
    }

    render(<JsonLd data={complexSchema} />)

    const script = document.head.querySelector('script[type="application/ld+json"]')
    const jsonContent = script?.textContent ?? ''
    const parsed = JSON.parse(jsonContent) as Record<string, unknown>

    expect(parsed).toEqual(complexSchema)
  })

  it('should remove pre-existing script with same ID', () => {
    // Pre-create a script in the DOM with the same ID
    const existingScript = document.createElement('script')
    existingScript.id = 'existing-schema'
    existingScript.type = 'application/ld+json'
    existingScript.textContent = JSON.stringify({ '@type': 'OldSchema' })
    document.head.appendChild(existingScript)

    // Verify it exists
    expect(document.getElementById('existing-schema')).toBeInTheDocument()

    // Now render JsonLd with the same ID - it should remove the existing one
    render(<JsonLd data={mockSchema} id="existing-schema" />)

    // Should only be one script with this ID
    const scripts = document.querySelectorAll('#existing-schema')
    expect(scripts.length).toBe(1)

    // And it should contain the new data, not the old
    const script = document.getElementById('existing-schema')
    const jsonContent = script?.textContent ?? ''
    const parsed = JSON.parse(jsonContent) as Record<string, unknown>
    expect(parsed).toEqual(mockSchema)
    expect(parsed['@type']).not.toBe('OldSchema')
  })
})
