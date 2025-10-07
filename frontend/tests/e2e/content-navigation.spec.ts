// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for content navigation.
 * Reference: quickstart.md:220-234 (Test 5: Content Navigation)
 */

import { test, expect } from '@playwright/test';

test.describe('Content Navigation', () => {
  test('should navigate to product page', async ({ page }) => {
    await page.goto('/');

    // Click on a product link
    const productLink = page.locator('a[href*="/products/"]').first();
    await productLink.click();

    // Should navigate to product page
    await expect(page).toHaveURL(/\/products\//);

    // Page should load product content
    const productTitle = page.locator('[data-testid="product-title"]');
    await expect(productTitle).toBeVisible();
  });

  test('should maintain language on navigation', async ({ page }) => {
    // Start on Italian homepage
    await page.goto('/it');

    // Navigate to another page
    const link = page.locator('a[href*="/it/"]').first();
    await link.click();

    // Should still be in Italian
    await expect(page).toHaveURL(/\/it/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  });

  test('should load breadcrumb navigation', async ({ page }) => {
    await page.goto('/products/category/test-product');

    // Should show breadcrumbs
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Should contain Home > Category > Product
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Category');
  });

  test('should navigate back to homepage from breadcrumb', async ({ page }) => {
    await page.goto('/products/test-product');

    // Click home in breadcrumb
    const homeLink = page.locator('[data-testid="breadcrumb-home"]');
    await homeLink.click();

    // Should navigate to homepage
    await expect(page).toHaveURL('/');
  });

  test('should show related products', async ({ page }) => {
    await page.goto('/products/test-product');

    // Should show related products section
    const relatedSection = page.locator('[data-testid="related-products"]');
    await expect(relatedSection).toBeVisible();

    // Should have at least one related product
    const relatedProduct = page.locator('[data-testid="related-product"]').first();
    await expect(relatedProduct).toBeVisible();
  });

  test('should handle 404 for non-existent content', async ({ page }) => {
    const response = await page.goto('/products/non-existent-product');

    // Should return 404
    expect(response?.status()).toBe(404);

    // Should show 404 page
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
  });

  test('should navigate using category filter', async ({ page }) => {
    await page.goto('/products');

    // Select category filter
    await page.locator('[data-testid="category-filter"]').click();
    await page.locator('[data-testid="category-electronics"]').click();

    // URL should update with filter
    await expect(page).toHaveURL(/category=electronics/);

    // Should show filtered products
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test('should paginate through product listings', async ({ page }) => {
    await page.goto('/products');

    // Go to page 2
    const nextPage = page.locator('[data-testid="pagination-next"]');
    await nextPage.click();

    // URL should update
    await expect(page).toHaveURL(/page=2/);

    // Should load new products
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
  });
});
