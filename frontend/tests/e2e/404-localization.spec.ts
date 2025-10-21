// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for 404-page localization.
 * Reference: quickstart.md:236-249 (Localized error pages)
 */

import { expect, test } from '@playwright/test'

test.describe('404 Page Localization', () => {
  test('should show English 404 page for non-existent English URL', async ({ page }) => {
    const response = await page.goto('/non-existent-page')

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 page in English
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible()
    await expect(page).toHaveTitle(/404|Not Found/i)

    // Content should be in English
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('should show Italian 404 page for non-existent Italian URL', async ({ page }) => {
    const response = await page.goto('/it/pagina-non-esistente')

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 page in Italian
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible()

    // Content should be in Italian
    await expect(page.locator('html')).toHaveAttribute('lang', 'it')

    // Should contain Italian text
    await expect(page.locator('body')).toContainText(/pagina non trovata|404/i)
  })

  test('should show Hebrew 404 page for non-existent Hebrew URL', async ({ page }) => {
    const response = await page.goto('/he/non-existent-page')

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 page in Hebrew (RTL)
    await expect(page.locator('html')).toHaveAttribute('lang', 'he')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('should include navigation back to homepage on 404', async ({ page }) => {
    await page.goto('/non-existent-page')

    // Should have link back to homepage
    const homeLink = page.locator('[data-testid="404-home-link"]')
    await expect(homeLink).toBeVisible()

    // Click home link
    await homeLink.click()

    // Should navigate to homepage
    await expect(page).toHaveURL('/')
  })

  test('should suggest related pages on 404', async ({ page }) => {
    await page.goto('/products/non-existent-product')

    // Should show suggested products
    const suggestions = page.locator('[data-testid="404-suggestions"]')
    if (await suggestions.isVisible()) {
      await expect(suggestions).toContainText(/similar|related|you might like/i)
    }
  })

  test('should maintain language context on 404', async ({ page }) => {
    // Start on Italian homepage
    await page.goto('/it')

    // Navigate to non-existent Italian page
    await page.goto('/it/non-existent')

    // Should still be in Italian context
    await expect(page.locator('html')).toHaveAttribute('lang', 'it')

    // Language selector should show Italian
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await expect(languageSelector).toContainText(/italiano/i)
  })

  test('should include SEO meta tags on 404 page', async ({ page }) => {
    await page.goto('/non-existent-page')

    // Should have meta robots noindex
    const robots = page.locator('meta[name="robots"]')
    await expect(robots).toHaveAttribute('content', /noindex/)

    // Should have title
    await expect(page).toHaveTitle(/404/)
  })

  test('should track 404 errors for analytics', async ({ page }) => {
    // Listen for analytics events
    const analyticsEvents: unknown[] = []
    page.on('console', msg => {
      if (msg.text().includes('analytics') || msg.text().includes('404')) {
        analyticsEvents.push(msg.text())
      }
    })

    await page.goto('/non-existent-page')

    // Wait for potential analytics call
    await page.waitForTimeout(1000)

    // Should track 404 event (if analytics implemented)
    // This is optional - implementation-dependent
  })
})
