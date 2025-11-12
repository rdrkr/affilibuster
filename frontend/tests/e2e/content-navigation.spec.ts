// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for content navigation.
 * Reference: quickstart.md:220-234 (Test 5: Content Navigation)
 */

import { expect, test } from '../fixtures'
import { CodeEnum } from '@/lib/generated/types.gen'
import { navigateAndWait, waitForNavigation } from '../helpers/waits'
import { handlePageModals } from '../helpers/modals'

test.describe('Content Navigation', () => {
  test('should load product page', async ({ page }) => {
    // Navigate directly to a product page
    await navigateAndWait(page, '/en/products/premium-wireless-earbuds')

    // Should be on the product page
    await expect(page).toHaveURL(/\/en\/products\/premium-wireless-earbuds/)

    // Page should load product content
    const productTitle = page.locator('[data-testid="product-title"]')
    await expect(productTitle).toBeVisible()
  })

  test('should maintain language on navigation', async ({ page }) => {
    // Start on Italian homepage
    await navigateAndWait(page, '/it')

    // Handle any modals that appear (language prompt, etc.)
    await handlePageModals(page)

    // Navigate to another page - use a link in main content area (visible on mobile)
    // Explicitly exclude nav/header links which are hidden in mobile hamburger menu
    const link = page.locator('a[href*="/it/"]:not(nav a):not(header a)').first()
    await expect(link).toBeVisible()
    await link.click()

    // Should still be in Italian
    await expect(page).toHaveURL(/\/it/)
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.IT)
  })

  test('should load breadcrumb navigation', async ({ page }) => {
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Should show breadcrumbs
    const breadcrumb = page.locator('[data-testid="breadcrumb"]')
    await expect(breadcrumb).toBeVisible()

    // Should contain Home > Products > Product
    await expect(breadcrumb).toContainText('Home')
    await expect(breadcrumb).toContainText('Products')
  })

  test('should navigate back to homepage from breadcrumb', async ({ page }) => {
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Verify home link in breadcrumb exists
    const homeLink = page.locator('[data-testid="breadcrumb-home"]')
    await expect(homeLink).toBeVisible()

    // Click home in breadcrumb and wait for navigation
    await waitForNavigation(page, /\/(en|it|he)\/?$/, () => homeLink.click())

    // Should navigate to homepage (with language prefix)
    await expect(page).toHaveURL(/\/(en|it|he)\/?$/)
  })

  test('should show related products', async ({ page }) => {
    await navigateAndWait(page, '/en/products/smart-fitness-watch')

    // Wait for client-side hydration to complete
    // The RelatedProducts component is a 'use client' component that renders after hydration
    await page.waitForLoadState('domcontentloaded')

    // Should show related products section (wait for it to be attached first)
    const relatedSection = page.locator('[data-testid="related-products"]')
    await expect(relatedSection).toBeAttached()
    await expect(relatedSection).toBeVisible()

    // Should have at least one related product
    const relatedProduct = page.locator('[data-testid="related-product"]').first()
    await expect(relatedProduct).toBeVisible()
  })

  test('should handle 404 for non-existent content', async ({ page }) => {
    const response = await page.goto('/en/products/non-existent-product', { waitUntil: 'networkidle' })

    // Should return 404
    expect(response?.status()).toBe(404)

    // Should show 404 page content (the actual 404 page doesn't have a data-testid)
    // Look for the "Page Not Found" heading which is always present on 404 pages
    const pageNotFoundHeading = page.getByRole('heading', { name: /Page Not Found/i })
    await expect(pageNotFoundHeading).toBeVisible()

    // Verify the 404 message is displayed
    await expect(page.locator('body')).toContainText(/404/)
  })

  // Skipped: Category filter feature not yet implemented
  test.skip('should navigate using category filter', async ({ page }) => {
    await page.goto('/en/products')

    // Select category filter
    await page.locator('[data-testid="category-filter"]').click()
    await page.locator('[data-testid="category-electronics"]').click()

    // URL should update with filter
    await expect(page).toHaveURL(/category=electronics/)

    // Should show filtered products
    const products = page.locator('[data-testid="product-card"]')
    await expect(products.first()).toBeVisible()
  })

  // Skipped: Pagination feature not yet implemented (only 4 products in seed data)
  test.skip('should paginate through product listings', async ({ page }) => {
    await page.goto('/en/products')

    // Check if pagination exists (may not exist if too few products)
    const nextPage = page.locator('[data-testid="pagination-next"]')
    const paginationExists = (await nextPage.count()) > 0

    if (paginationExists) {
      // If pagination exists, test navigation to page 2
      await nextPage.click()

      // URL should update
      await expect(page).toHaveURL(/page=2/)

      // Should load products on page 2
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
    } else {
      // If no pagination, verify all products are shown on single page
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()
    }
  })
})
