// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for sitemap generation validation.
 * Reference: research.md:420-440 (Dynamic sitemap generation)
 */

import { test, expect } from '../fixtures'

test.describe('Sitemap', () => {
  test('should generate sitemap.xml', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Should return 200
    expect(response?.status()).toBe(200)

    // Should be XML content type
    const contentType = response?.headers()['content-type'] ?? ''
    expect(contentType).toContain('xml')
  })

  test('should include all languages in sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Use response.text() to get raw XML content (page.content() returns HTML viewer in WebKit)
    const content = (await response?.text()) ?? ''

    // Should include URLs for all languages
    expect(content).toContain('<loc>')
    expect(content).toContain('/en/')
    expect(content).toContain('/it/')
    expect(content).toContain('/he/') // Hebrew
  })

  test('should include xhtml:link for alternate languages', async ({ page }) => {
    // Test language-specific sitemap (not the main sitemap.xml)
    // Next.js MetadataRoute.Sitemap doesn't support xhtml:link
    const response = await page.goto('/sitemap-en.xml')

    // Use response.text() to get raw XML content
    const content = (await response?.text()) ?? ''

    // Should include xhtml:link tags
    expect(content).toContain('xhtml:link')
    expect(content).toContain('rel="alternate"')
    expect(content).toContain('hreflang=')
  })

  test('should include lastmod dates', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Use response.text() to get raw XML content
    const content = (await response?.text()) ?? ''

    // Should include lastmod tags
    expect(content).toContain('<lastmod>')

    // Lastmod should be valid ISO date
    const lastmodMatch = /<lastmod>([^<]+)<\/lastmod>/.exec(content)
    if (lastmodMatch?.[1]) {
      const date = new Date(lastmodMatch[1])
      expect(date.toString()).not.toBe('Invalid Date')
    }
  })

  test('should include changefreq and priority', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Use response.text() to get raw XML content
    const content = (await response?.text()) ?? ''

    // Should include changefreq
    expect(content).toContain('<changefreq>')

    // Should include priority
    expect(content).toContain('<priority>')
  })

  test('should generate sitemap index for large sites', async ({ page }) => {
    const response = await page.goto('/sitemap_index.xml')

    // If site is large enough, should have sitemap index
    if (response?.status() === 200) {
      // Use response.text() to get raw XML content
      const content = (await response.text()) ?? ''

      // Should be sitemapindex format
      expect(content).toContain('<sitemapindex')
      expect(content).toContain('<sitemap>')
    }
  })

  test('should generate language-specific sitemaps', async ({ page }) => {
    // English sitemap
    const enResponse = await page.goto('/sitemap-en.xml')
    if (enResponse?.status() === 200) {
      // Use response.text() to get raw XML content
      const enContent = (await enResponse.text()) ?? ''
      expect(enContent).toContain('/en/')
    }

    // Italian sitemap
    const itResponse = await page.goto('/sitemap-it.xml')
    if (itResponse?.status() === 200) {
      // Use response.text() to get raw XML content
      const itContent = (await itResponse.text()) ?? ''
      expect(itContent).toContain('/it/')
    }
  })

  test('should not include archived content in sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Use response.text() to get raw XML content
    const content = (await response?.text()) ?? ''

    // Should not contain archived product URLs
    expect(content).not.toContain('/archived-product')
  })

  test('should respect robots.txt noindex directives', async ({ page }) => {
    const response = await page.goto('/sitemap.xml')

    // Use response.text() to get raw XML content
    const content = (await response?.text()) ?? ''

    // Should not include URLs marked as noindex
    // (test pages, admin pages, etc.)
    expect(content).not.toContain('/admin/')
    expect(content).not.toContain('/test/')
  })
})
