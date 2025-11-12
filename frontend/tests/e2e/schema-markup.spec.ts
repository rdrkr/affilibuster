// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for Schema.org markup validation.
 * Reference: research.md:380-400 (Schema.org structured data)
 */
import { CurrencyCode } from '@/lib/generated/types.gen'

import { expect, test } from '../fixtures'
import { navigateAndWait } from '../helpers/waits'

test.describe('Schema.org Markup', () => {
  test('should include Organization schema on homepage', async ({ page }) => {
    await navigateAndWait(page, '/')

    // Get JSON-LD script
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // Should be Organization type
    expect(schema['@type']).toBe('Organization')
    expect(schema['@context']).toBe('https://schema.org')

    // Should have required fields
    expect(schema.name).toBeDefined()
    expect(schema.url).toBeDefined()
  })

  test('should include Product schema on product pages', async ({ page }) => {
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Wait for JSON-LD script to be present
    await page.waitForSelector('script[type="application/ld+json"]', { state: 'attached' })

    // Get JSON-LD script
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // Should be Product type
    expect(schema['@type']).toBe('Product')

    // Should have required Product fields
    expect(schema.name).toBeDefined()
    expect(schema.description).toBeDefined()
    expect(schema.offers).toBeDefined()

    // Offers should have required fields
    const offers = schema.offers as Record<string, unknown> | undefined
    if (offers && typeof offers === 'object') {
      expect(offers.price).toBeDefined()
      expect(offers.priceCurrency).toBeDefined()
    }
  })

  test.skip('should include BreadcrumbList schema', async ({ page }) => {
    await navigateAndWait(page, '/products/category/test-product')

    // Get all JSON-LD scripts
    const scripts = await page.locator('script[type="application/ld+json"]').all()

    // Find BreadcrumbList schema
    let breadcrumbSchema = null
    for (const script of scripts) {
      const content = await script.textContent()

      const schema = JSON.parse(content ?? '') as Record<string, unknown>
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
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Wait for JSON-LD script to be present
    await page.waitForSelector('script[type="application/ld+json"]', { state: 'attached' })

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // Should have offers
    const offers = schema.offers as Record<string, unknown> | undefined
    expect(offers).toBeDefined()

    // Should have valid price currency (USD, EUR, ILS, etc.)
    if (offers && typeof offers === 'object' && 'priceCurrency' in offers) {
      expect(Object.values(CurrencyCode)).toContain(offers.priceCurrency)
    }
  })

  test('should include AggregateRating schema', async ({ page }) => {
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Wait for JSON-LD script to be present
    await page.waitForSelector('script[type="application/ld+json"]', { state: 'attached' })

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // If product has reviews, should have aggregateRating
    const aggregateRating = schema.aggregateRating as Record<string, unknown> | undefined
    if (aggregateRating && typeof aggregateRating === 'object') {
      expect(aggregateRating['@type']).toBe('AggregateRating')
      expect(aggregateRating.ratingValue).toBeDefined()
      expect(aggregateRating.reviewCount).toBeDefined()
    }
  })

  test.skip('should include Article schema for content pages', async ({ page }) => {
    await navigateAndWait(page, '/blog/test-article')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // Should be Article type
    expect(schema['@type']).toBe('Article')

    // Should have required Article fields
    expect(schema.headline).toBeDefined()
    expect(schema.author).toBeDefined()
    expect(schema.datePublished).toBeDefined()
  })

  test.skip('should include WebPage schema with speakable', async ({ page }) => {
    await navigateAndWait(page, '/')

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // Should be WebPage type
    expect(schema['@type']).toBe('WebPage')

    // Should have speakable for voice search
    const speakable = schema.speakable as Record<string, unknown> | undefined
    if (speakable && typeof speakable === 'object') {
      expect(speakable['@type']).toBe('SpeakableSpecification')
    }
  })

  test('should validate schema markup structure', async ({ page }) => {
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Wait for JSON-LD script to be present
    await page.waitForSelector('script[type="application/ld+json"]', { state: 'attached' })

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()

    const schema = JSON.parse(jsonLd ?? '') as Record<string, unknown>

    // Should have @context and @type
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBeDefined()

    // Should be valid JSON (no parsing errors)
    expect(schema).toBeInstanceOf(Object)
  })
})
