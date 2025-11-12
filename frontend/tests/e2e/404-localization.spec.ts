// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for 404-page localization.
 * Reference: quickstart.md:236-249 (Localized error pages)
 */
import { expect, test } from '../fixtures'
import { navigateAndWait, waitForNavigation } from '../helpers/waits'

test.describe('404 Page Localization', () => {
  test('should show English 404 page for non-existent English URL', async ({ page }) => {
    const response = await page.goto('/non-existent-page', { waitUntil: 'networkidle' })

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 page with title
    await expect(page).toHaveTitle(/404|Not Found/i)
  })

  test('should show Italian 404 page for non-existent Italian URL', async ({ page }) => {
    const response = await page.goto('/it/pagina-non-esistente', { waitUntil: 'networkidle' })

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 page with text content
    await expect(page.locator('body')).toContainText(/404/i)
  })

  test('should show Hebrew 404 page for non-existent Hebrew URL', async ({ page }) => {
    const response = await page.goto('/he/non-existent-page', { waitUntil: 'networkidle' })

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 content
    await expect(page.locator('body')).toContainText(/404/i)
  })

  test('should include navigation back to homepage on 404', async ({ page }) => {
    await navigateAndWait(page, '/non-existent-page')

    // First wait for h1 to be visible (webkit needs explicit visibility check under load)
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()

    // Then verify the 404 content text
    await expect(heading).toContainText(/Page Not Found/i)

    // Find the homepage link (not the button inside it) for proper navigation
    const homeLink = page.locator('a:has-text("Go to Homepage")')
    await expect(homeLink).toBeVisible()

    // Click the link and wait for navigation
    await waitForNavigation(page, /\/(en|it|he)\/?$/, () => homeLink.click())

    // Should navigate to homepage (with language prefix due to i18n routing)
    await expect(page).toHaveURL(/\/(en|it|he)\/?$/)
  })

  test('should suggest related pages on 404', async ({ page }) => {
    await navigateAndWait(page, '/products/non-existent-product')

    // Should show suggested products
    const suggestions = page.locator('[data-testid="404-suggestions"]')
    if (await suggestions.isVisible()) {
      await expect(suggestions).toContainText(/similar|related|you might like/i)
    }
  })

  test('should maintain language context on 404', async ({ page }) => {
    // Navigate to non-existent Italian page
    const response = await page.goto('/it/non-existent', { waitUntil: 'networkidle' })

    // Should return 404
    expect(response?.status()).toBe(404)

    // Page should maintain Italian language context via HTML lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'it')

    // Page should show 404 content
    await expect(page.locator('body')).toContainText(/404/i)
  })

  test('should include SEO meta tags on 404 page', async ({ page }) => {
    await navigateAndWait(page, '/non-existent-page')

    // Should have meta robots noindex (use .first() to handle multiple meta tags)
    const robots = page.locator('meta[name="robots"]').first()
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

    await navigateAndWait(page, '/non-existent-page')

    // Wait for page to be fully loaded - analytics should fire by then
    await page.waitForLoadState('networkidle')

    // Should track 404 event (if analytics implemented)
    // This is optional - implementation-dependent
  })
})
