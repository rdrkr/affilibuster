// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for Schema.org markup validation.
 * Reference: research.md:380-400 (Schema.org structured data)
 */

import { test, expect } from '@playwright/test'

test.describe('Schema.org Markup', () => {
  test('should include Organization schema on homepage', async ({ page }) => {
    await page.goto('/')

    // Get JSON-LD script
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // Should be Organization type
    expect(schema['@type']).toBe('Organization')
    expect(schema['@context']).toBe('https://schema.org')

    // Should have required fields
    expect(schema.name).toBeDefined()
    expect(schema.url).toBeDefined()
  })

  test('should include Product schema on product pages', async ({ page }) => {
    await page.goto('/products/test-product')

    // Get JSON-LD script
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // Should be Product type
    expect(schema['@type']).toBe('Product')

    // Should have required Product fields
    expect(schema.name).toBeDefined()
    expect(schema.description).toBeDefined()
    expect(schema.offers).toBeDefined()

    // Offers should have required fields
    expect(schema.offers.price).toBeDefined()
    expect(schema.offers.priceCurrency).toBeDefined()
  })

  test('should include BreadcrumbList schema', async ({ page }) => {
    await page.goto('/products/category/test-product')

    // Get all JSON-LD scripts
    const scripts = await page.locator('script[type="application/ld+json"]').all()

    // Find BreadcrumbList schema
    let breadcrumbSchema = null
    for (const script of scripts) {
      const content = await script.textContent()
      const schema = JSON.parse(content || '')
      if (schema['@type'] === 'BreadcrumbList') {
        breadcrumbSchema = schema
        break
      }
    }

    expect(breadcrumbSchema).toBeDefined()
    expect(breadcrumbSchema?.itemListElement).toBeDefined()
    expect(Array.isArray(breadcrumbSchema?.itemListElement)).toBeTruthy()
  })

  test('should include Offer schema with multiple currencies', async ({ page }) => {
    await page.goto('/products/test-product')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // Should have offers
    const offers = schema.offers
    expect(offers).toBeDefined()

    // Should have valid price currency (USD, EUR, ILS, etc.)
    expect(['USD', 'EUR', 'ILS', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']).toContain(offers.priceCurrency)
  })

  test('should include AggregateRating schema', async ({ page }) => {
    await page.goto('/products/test-product')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // If product has reviews, should have aggregateRating
    if (schema.aggregateRating) {
      expect(schema.aggregateRating['@type']).toBe('AggregateRating')
      expect(schema.aggregateRating.ratingValue).toBeDefined()
      expect(schema.aggregateRating.reviewCount).toBeDefined()
    }
  })

  test('should include Article schema for content pages', async ({ page }) => {
    await page.goto('/blog/test-article')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // Should be Article type
    expect(schema['@type']).toBe('Article')

    // Should have required Article fields
    expect(schema.headline).toBeDefined()
    expect(schema.author).toBeDefined()
    expect(schema.datePublished).toBeDefined()
  })

  test('should include WebPage schema with speakable', async ({ page }) => {
    await page.goto('/')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // Should be WebPage type
    expect(schema['@type']).toBe('WebPage')

    // Should have speakable for voice search
    if (schema.speakable) {
      expect(schema.speakable['@type']).toBe('SpeakableSpecification')
    }
  })

  test('should validate schema markup structure', async ({ page }) => {
    await page.goto('/products/test-product')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    const schema = JSON.parse(jsonLd || '')

    // Should have @context and @type
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBeDefined()

    // Should be valid JSON (no parsing errors)
    expect(schema).toBeInstanceOf(Object)
  })
})
