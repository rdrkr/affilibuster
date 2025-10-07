// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for SEO meta tags validation.
 * Reference: quickstart.md:200-218 (Test 5: SEO Meta Tags)
 */

import { test, expect } from '@playwright/test';

test.describe('SEO Meta Tags', () => {
  test('should include all required meta tags on homepage', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle(/Affilibuster/);

    // Meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Open Graph tags
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);

    // Twitter Card tags
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1);
  });

  test('should include hreflang tags for multi-language', async ({ page }) => {
    await page.goto('/');

    // Should have hreflang for all languages
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    const hreflangIt = page.locator('link[rel="alternate"][hreflang="it"]');
    const hreflangHe = page.locator('link[rel="alternate"][hreflang="he"]');
    const hreflangDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');

    await expect(hreflangEn).toHaveCount(1);
    await expect(hreflangIt).toHaveCount(1);
    await expect(hreflangHe).toHaveCount(1);
    await expect(hreflangDefault).toHaveCount(1);
  });

  test('should have correct canonical URL', async ({ page }) => {
    await page.goto('/');

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);

    const href = await canonical.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//); // Should be absolute URL
  });

  test('should update meta tags for different pages', async ({ page }) => {
    // Visit homepage
    await page.goto('/');
    const homeTitle = await page.title();

    // Visit about page
    await page.goto('/about');
    const aboutTitle = await page.title();

    // Titles should be different
    expect(homeTitle).not.toBe(aboutTitle);
  });

  test('should include language-specific meta tags', async ({ page }) => {
    // Italian page
    await page.goto('/it');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('it');

    // og:locale should be it_IT
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveAttribute('content', 'it_IT');
  });

  test('should include structured data (JSON-LD)', async ({ page }) => {
    await page.goto('/');

    // Should have JSON-LD script tag
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);

    // Should be valid JSON
    const jsonContent = await jsonLd.textContent();
    expect(() => JSON.parse(jsonContent || '')).not.toThrow();

    // Should have @context
    const data = JSON.parse(jsonContent || '');
    expect(data['@context']).toBe('https://schema.org');
  });

  test('should include robots meta tag', async ({ page }) => {
    await page.goto('/');

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /index.*follow/);
  });

  test('should include viewport meta tag', async ({ page }) => {
    await page.goto('/');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute(
      'content',
      'width=device-width, initial-scale=1'
    );
  });

  test('should include charset meta tag', async ({ page }) => {
    await page.goto('/');

    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'utf-8');
  });
});
