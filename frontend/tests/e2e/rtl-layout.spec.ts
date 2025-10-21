// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for RTL layout (Hebrew).
 * Reference: data-model.md:210-230 (RTL language support)
 */

import { test, expect } from '@playwright/test'

test.describe('RTL Layout', () => {
  test('should apply RTL direction for Hebrew pages', async ({ page }) => {
    // Visit Hebrew page
    await page.goto('/he')

    // HTML should have dir="rtl"
    const html = page.locator('html')
    await expect(html).toHaveAttribute('dir', 'rtl')
    await expect(html).toHaveAttribute('lang', 'he')
  })

  test('should NOT apply RTL for English or Italian', async ({ page }) => {
    // English
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')

    // Italian
    await page.goto('/it')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  })

  test('should mirror navigation layout in RTL', async ({ page }) => {
    // Visit Hebrew page
    await page.goto('/he')

    // Navigation should be right-aligned
    const nav = page.locator('nav[data-testid="main-navigation"]')
    const navStyles = await nav.evaluate(el => {
      return window.getComputedStyle(el).textAlign
    })

    // Should be right-aligned or flex-end
    expect(navStyles === 'right' || navStyles === 'end').toBeTruthy()
  })

  test('should mirror icons in RTL', async ({ page }) => {
    // Visit Hebrew page
    await page.goto('/he')

    // Icons that should be mirrored (arrows, etc.)
    const forwardIcon = page.locator('[data-testid="forward-arrow"]').first()

    if (await forwardIcon.isVisible()) {
      const transform = await forwardIcon.evaluate(el => {
        return window.getComputedStyle(el).transform
      })

      // Should have scaleX(-1) or rotate(180deg)
      expect(transform).toMatch(/scaleX\(-1\)|rotate\(180deg\)/)
    }
  })

  test('should display Hebrew text correctly', async ({ page }) => {
    // Visit Hebrew page
    await page.goto('/he')

    // Should contain Hebrew characters
    const content = await page.textContent('body')
    const hasHebrew = /[\u0590-\u05FF]/.test(content || '')

    expect(hasHebrew).toBeTruthy()
  })

  test('should preserve RTL on page navigation', async ({ page }) => {
    // Start on Hebrew homepage
    await page.goto('/he')

    // Navigate to another page
    await page.locator('a[href*="/he/"]').first().click()

    // Should still be RTL
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'he')
  })

  test('should handle mixed LTR content in RTL page', async ({ page }) => {
    // Visit Hebrew page with English product names
    await page.goto('/he/products')

    // English text should maintain LTR within RTL context
    const productName = page.locator('[data-testid="product-name"]').first()

    if (await productName.isVisible()) {
      const dir = await productName.getAttribute('dir')

      // If product name is in English, should have dir="ltr"
      if (dir) {
        expect(dir).toBe('ltr')
      }
    }
  })

  test('should display prices with correct currency symbol position in RTL', async ({ page }) => {
    // Visit Hebrew page
    await page.goto('/he/products')

    // ILS symbol (₪) should appear after amount in Hebrew
    const price = page.locator('[data-testid="price"]').first()

    if (await price.isVisible()) {
      const priceText = await price.textContent()

      // Hebrew uses: "100 ₪" (amount before symbol)
      expect(priceText).toMatch(/\d+.*₪/)
    }
  })
})
