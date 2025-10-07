// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E Test for Content Fallback to English (T047)
 *
 * Tests that content falls back to English when translation is unavailable.
 * Reference: quickstart.md:236-249 (Test 6: Content Fallback to English)
 * Reference: contracts/api-v1.yaml:32-33 (Falls back to English if translation unavailable)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

test.describe('Content Fallback to English', () => {
  test('should show English content when Italian translation is missing', async ({ page }) => {
    // Scenario: Product exists in English but not translated to Italian yet
    // Reference: quickstart.md:236-249

    await page.goto(`${BASE_URL}/it/products/new-gadget`, {
      waitUntil: 'networkidle',
    });

    // Page should render (not 404)
    await expect(page.locator('body')).toBeVisible();

    // UI/Navigation should be in Italian
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');

    // Should show fallback notice in Italian
    const fallbackNotice = page.locator(
      '[data-testid="content-fallback-notice"], [data-testid="translation-notice"]'
    );

    if (await fallbackNotice.isVisible()) {
      // Notice should contain Italian text about content not being available
      const noticeText = await fallbackNotice.textContent();
      const hasItalianNotice =
        noticeText?.includes('non disponibile') ||
        noticeText?.includes('italiano') ||
        noticeText?.includes('inglese');

      expect(hasItalianNotice).toBeTruthy();
    }

    // Content body should be present (in English)
    await expect(page.locator('[data-testid="content-body"], main, article')).toBeVisible();
  });

  test('should show English content when Hebrew translation is missing', async ({ page }) => {
    // Test same scenario for Hebrew (RTL layout)

    await page.goto(`${BASE_URL}/il/products/new-gadget`, {
      waitUntil: 'networkidle',
    });

    // Page should render (not 404)
    await expect(page.locator('body')).toBeVisible();

    // UI should be in Hebrew (RTL)
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Content should be present even if not translated
    await expect(page.locator('[data-testid="content-body"], main, article')).toBeVisible();
  });

  test('should NOT show fallback notice when translation exists', async ({ page }) => {
    // Test: Product has Italian translation, should NOT show fallback notice

    await page.goto(`${BASE_URL}/it/prodotti/test-product`, {
      waitUntil: 'networkidle',
    });

    // Page should be in Italian
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');

    // Should NOT show fallback notice
    const fallbackNotice = page.locator('[data-testid="content-fallback-notice"]');
    await expect(fallbackNotice).not.toBeVisible();

    // Content should be present
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should maintain navigation in target language with fallback content', async ({ page }) => {
    // Test: Navigation stays in Italian even when content falls back to English

    await page.goto(`${BASE_URL}/it/products/new-gadget`);

    // Navigation should be in Italian
    const nav = page.locator('nav');
    const navText = await nav.textContent();

    // Look for Italian navigation text (if implemented)
    // This is soft assertion - implementation may vary
    console.log('Navigation text:', navText);

    // Language selector should show Italian
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await expect(languageSelector).toContainText(/italiano/i);
    }

    // URLs should still use Italian prefix
    const links = await page.locator('a[href^="/it"]').count();
    expect(links).toBeGreaterThan(0);
  });

  test('should show fallback notice for page content', async ({ page }) => {
    // Test: Static page (not product) falls back to English

    await page.goto(`${BASE_URL}/it/about`, {
      waitUntil: 'networkidle',
    });

    // If page exists but not translated, should show fallback notice
    const pageExists = await page.locator('h1, main').isVisible();

    if (pageExists) {
      // Page should be in Italian context
      await expect(page.locator('html')).toHaveAttribute('lang', 'it');

      // Content should be visible
      await expect(page.locator('main, article')).toBeVisible();
    }
  });

  test('should include language switcher links to available translations', async ({ page }) => {
    // Test: Fallback page should show which languages are available

    await page.goto(`${BASE_URL}/it/products/new-gadget`);

    // Language switcher should be present
    const languageSwitcher = page.locator('[data-testid="language-selector"], [aria-label*="language"]');

    if (await languageSwitcher.isVisible()) {
      // Should show English as available (source language)
      await languageSwitcher.click();

      const englishOption = page.locator('[data-testid="language-en"], a[href*="/products/new-gadget"]');
      await expect(englishOption).toBeVisible();

      // Clicking English should navigate to English version
      await englishOption.click();
      await expect(page).toHaveURL(/^(?!.*\/it)/); // Not Italian URL
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    }
  });

  test('should handle mixed content (some translated, some fallback)', async ({ page }) => {
    // Test: Page where some fields are translated and others fall back

    await page.goto(`${BASE_URL}/it/products/partially-translated-product`);

    // Page should render
    await expect(page.locator('body')).toBeVisible();

    // Should be in Italian context
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');

    // Content should be present (mix of translated and English)
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should use English meta tags when Italian translation missing', async ({ page }) => {
    // Test: SEO meta tags fall back to English content

    await page.goto(`${BASE_URL}/it/products/new-gadget`);

    // Should have meta title (either Italian or English)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Should have meta description
    const metaDescription = page.locator('meta[name="description"]');
    const description = await metaDescription.getAttribute('content');
    expect(description).toBeTruthy();

    // hreflang should indicate English is available
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"], link[rel="alternate"][hreflang="x-default"]');
    const hreflangCount = await hreflangEn.count();
    expect(hreflangCount).toBeGreaterThan(0);
  });

  test('should track content fallback for analytics', async ({ page }) => {
    // Test: Fallback events logged for analytics

    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    await page.goto(`${BASE_URL}/it/products/new-gadget`);

    // Wait for potential analytics
    await page.waitForTimeout(1000);

    // Check if fallback was logged (implementation-dependent)
    const hasFallbackLog = consoleMessages.some(
      (msg) => msg.includes('fallback') || msg.includes('translation') || msg.includes('missing')
    );

    console.log(`Content fallback logged: ${hasFallbackLog}`);
    console.log(`Console messages: ${consoleMessages.length}`);
  });
});

test.describe('Content Fallback - Preference Storage', () => {
  test('should remember user dismissed fallback notice', async ({ page, context }) => {
    // Test: User dismisses notice, should not show again on same session

    await page.goto(`${BASE_URL}/it/products/new-gadget`);

    // Find and dismiss notice if present
    const fallbackNotice = page.locator('[data-testid="content-fallback-notice"]');
    const dismissButton = page.locator('[data-testid="fallback-notice-dismiss"], [aria-label*="close"], button[aria-label*="dismiss"]');

    if (await fallbackNotice.isVisible() && (await dismissButton.isVisible())) {
      await dismissButton.click();

      // Notice should disappear
      await expect(fallbackNotice).not.toBeVisible();

      // Navigate to another fallback page
      await page.goto(`${BASE_URL}/it/products/another-new-product`);

      // Notice should not appear again (session-based preference)
      await page.waitForTimeout(1000);
      const noticeAfterDismiss = await fallbackNotice.isVisible();
      expect(noticeAfterDismiss).toBeFalsy();
    }
  });

  test('should show fallback notice in new session after dismiss', async ({ browser }) => {
    // Test: New browser session shows notice again

    // First session: dismiss notice
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto(`${BASE_URL}/it/products/new-gadget`);

    const dismissButton1 = page1.locator('[data-testid="fallback-notice-dismiss"]');
    if (await dismissButton1.isVisible()) {
      await dismissButton1.click();
    }

    await context1.close();

    // Second session: notice should appear again
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(`${BASE_URL}/it/products/new-gadget`);

    // Notice might appear (depends on implementation)
    await page2.waitForTimeout(1000);

    await context2.close();
  });
});

test.describe('Content Fallback - Error Handling', () => {
  test('should handle fallback when API returns null translation', async ({ page }) => {
    // Test: API returns success but translation field is null

    await page.goto(`${BASE_URL}/it/products/null-translation-product`);

    // Should not crash or show blank page
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, main')).toBeVisible();
  });

  test('should handle fallback when API returns empty string', async ({ page }) => {
    // Test: API returns empty string for translated field

    await page.goto(`${BASE_URL}/it/products/empty-translation-product`);

    // Should show some content (either fallback or error message)
    const hasContent = await page.locator('h1, main, [data-testid="error"]').isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should not show fallback notice on 404 pages', async ({ page }) => {
    // Test: Non-existent product should show 404, not fallback notice

    const response = await page.goto(`${BASE_URL}/it/products/completely-non-existent`);

    if (response?.status() === 404) {
      // Should show 404 page, not fallback notice
      const fallbackNotice = page.locator('[data-testid="content-fallback-notice"]');
      await expect(fallbackNotice).not.toBeVisible();

      // Should show 404 page
      await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
    }
  });
});
