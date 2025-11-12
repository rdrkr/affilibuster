// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E tests for performance optimization features.
 * These tests verify that performance optimizations are correctly configured.
 *
 * Note: Actual performance timing tests are in tests/performance/ directory
 * which includes network throttling and comprehensive Web Vitals measurements.
 */

import { test, expect } from '../fixtures'
import { navigateAndWait } from '../helpers/waits'

test.describe('Performance Optimizations', () => {
  test('should lazy load images below the fold', async ({ page }) => {
    await navigateAndWait(page, '/')

    // Check images have loading="lazy"
    const images = page.locator('img[loading="lazy"]')
    const count = await images.count()

    // Should have at least some lazy-loaded images
    expect(count).toBeGreaterThan(0)
  })

  test('should use Next.js Image optimization', async ({ page }) => {
    await navigateAndWait(page, '/products')

    // Product images should use Next.js Image component
    // (generates srcset, uses WebP, etc.)
    const productImage = page.locator('[data-testid="product-image"]').first()

    if (await productImage.isVisible()) {
      const srcset = await productImage.getAttribute('srcset')

      // Should have multiple sizes in srcset
      expect(srcset).toBeTruthy()
      expect(srcset?.split(',').length).toBeGreaterThan(1)
    }
  })

  test('should prefetch critical resources', async ({ page }) => {
    await navigateAndWait(page, '/')

    // Check for prefetch/preload links
    const preloadLinks = page.locator('link[rel="preload"], link[rel="prefetch"]')
    const count = await preloadLinks.count()

    // Should have some prefetched resources
    expect(count).toBeGreaterThan(0)
  })

  test('should bundle JavaScript efficiently', async ({ page }) => {
    await navigateAndWait(page, '/')

    // Get all loaded scripts
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(s => (s as HTMLScriptElement).src)
    })

    // Should use code splitting (multiple chunks)
    expect(scripts.length).toBeGreaterThan(1)

    // Hashed filenames only available in production builds
    // Skip hash check in development (detected by presence of dev-specific paths or chunks directory structure)
    const isDevBuild = scripts.some(
      src =>
        src.includes('[turbopack]') ||
        src.includes('/chunks/src_') ||
        src.includes('/dev/') ||
        !src.includes('/_next/static/chunks')
    )

    if (!isDevBuild) {
      // Should have hashed filenames for caching in production
      const hashedScripts = scripts.filter(src => /\.[a-f0-9]{8,}\./i.test(src))
      expect(hashedScripts.length).toBeGreaterThan(0)
    }
  })

  test('should use font optimization', async ({ page }) => {
    await navigateAndWait(page, '/')

    // Check for font-display: swap
    const fontFaces = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets)
      const fontRules: unknown[] = []

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule instanceof CSSFontFaceRule) {
              fontRules.push(rule.style.getPropertyValue('font-display'))
            }
          }
        } catch {
          // CORS - skip
        }
      }

      return fontRules
    })

    // Should use font-display: swap (if custom fonts used)
    if (fontFaces.length > 0) {
      expect(fontFaces).toContain('swap')
    }
  })

  test('should use compression for assets', async ({ page, context }) => {
    // Enable request interception to check headers
    await context.route('**/*', route => route.continue())

    const response = await page.goto('/')

    // Check if response is compressed
    const encoding = response?.headers()['content-encoding']

    // Should use gzip or brotli
    expect(encoding === 'gzip' || encoding === 'br').toBeTruthy()
  })
})
