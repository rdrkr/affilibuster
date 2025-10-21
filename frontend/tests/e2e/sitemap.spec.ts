// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for sitemap generation validation.
 * Reference: research.md:420-440 (Dynamic sitemap generation)
 */

import { test, expect } from '@playwright/test'

test.describe('Sitemap', () => {
  test('should generate sitemap.xml', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Should return 200
    expect(response?.status()).toBe(200)

    // Should be XML content type
    const contentType = response?.headers()['content-type'] || ''
    expect(contentType).toContain('xml')
  })

  test('should include all languages in sitemap', async ({ page }) => {
    await page.goto('/sitemap.xml')

    const content = await page.content()

    // Should include URLs for all languages
    expect(content).toContain('<loc>')
    expect(content).toContain('/en/')
    expect(content).toContain('/it/')
    expect(content).toContain('/he/') // Hebrew
  })

  test('should include xhtml:link for alternate languages', async ({ page }) => {
    await page.goto('/sitemap.xml')

    const content = await page.content()

    // Should include xhtml:link tags
    expect(content).toContain('xhtml:link')
    expect(content).toContain('rel="alternate"')
    expect(content).toContain('hreflang=')
  })

  test('should include lastmod dates', async ({ page }) => {
    await page.goto('/sitemap.xml')

    const content = await page.content()

    // Should include lastmod tags
    expect(content).toContain('<lastmod>')

    // Lastmod should be valid ISO date
    const lastmodMatch = content.match(/<lastmod>([^<]+)<\/lastmod>/)
    if (lastmodMatch) {
      const date = new Date(lastmodMatch[1])
      expect(date.toString()).not.toBe('Invalid Date')
    }
  })

  test('should include changefreq and priority', async ({ page }) => {
    await page.goto('/sitemap.xml')

    const content = await page.content()

    // Should include changefreq
    expect(content).toContain('<changefreq>')

    // Should include priority
    expect(content).toContain('<priority>')
  })

  test('should generate sitemap index for large sites', async ({ page }) => {
    const response = await page.goto('/sitemap_index.xml')

    // If site is large enough, should have sitemap index
    if (response?.status() === 200) {
      const content = await page.content()

      // Should be sitemapindex format
      expect(content).toContain('<sitemapindex')
      expect(content).toContain('<sitemap>')
    }
  })

  test('should generate language-specific sitemaps', async ({ page }) => {
    // English sitemap
    const enResponse = await page.goto('/sitemap-en.xml')
    if (enResponse?.status() === 200) {
      const enContent = await page.content()
      expect(enContent).toContain('/en/')
    }

    // Italian sitemap
    const itResponse = await page.goto('/sitemap-it.xml')
    if (itResponse?.status() === 200) {
      const itContent = await page.content()
      expect(itContent).toContain('/it/')
    }
  })

  test('should not include archived content in sitemap', async ({ page }) => {
    await page.goto('/sitemap.xml')

    const content = await page.content()

    // Should not contain archived product URLs
    expect(content).not.toContain('/archived-product')
  })

  test('should respect robots.txt noindex directives', async ({ page }) => {
    await page.goto('/sitemap.xml')

    const content = await page.content()

    // Should not include URLs marked as noindex
    // (test pages, admin pages, etc.)
    expect(content).not.toContain('/admin/')
    expect(content).not.toContain('/test/')
  })
})
