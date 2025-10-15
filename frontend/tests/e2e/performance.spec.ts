// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for performance targets.
 * Reference: quickstart.md:251-270 (Test 7: Performance Metrics)
 */

import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load homepage within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load in under 2000ms
    expect(loadTime).toBeLessThan(2000);
  });

  test('should achieve good Lighthouse scores', async ({ page }) => {
    await page.goto('/');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    // Performance targets
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // FCP < 1.5s
    expect(metrics.domContentLoaded).toBeLessThan(2000); // DCL < 2s
  });

  test('should lazy load images below the fold', async ({ page }) => {
    await page.goto('/');

    // Check images have loading="lazy"
    const images = page.locator('img[loading="lazy"]');
    const count = await images.count();

    // Should have at least some lazy-loaded images
    expect(count).toBeGreaterThan(0);
  });

  test('should use Next.js Image optimization', async ({ page }) => {
    await page.goto('/products');

    // Product images should use Next.js Image component
    // (generates srcset, uses WebP, etc.)
    const productImage = page.locator('[data-testid="product-image"]').first();

    if (await productImage.isVisible()) {
      const srcset = await productImage.getAttribute('srcset');

      // Should have multiple sizes in srcset
      expect(srcset).toBeTruthy();
      expect(srcset?.split(',').length).toBeGreaterThan(1);
    }
  });

  test('should prefetch critical resources', async ({ page }) => {
    await page.goto('/');

    // Check for prefetch/preload links
    const preloadLinks = page.locator('link[rel="preload"], link[rel="prefetch"]');
    const count = await preloadLinks.count();

    // Should have some prefetched resources
    expect(count).toBeGreaterThan(0);
  });

  test('should bundle JavaScript efficiently', async ({ page }) => {
    await page.goto('/');

    // Get all loaded scripts
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).map(
        (s) => (s as HTMLScriptElement).src
      );
    });

    // Should use code splitting (multiple chunks)
    expect(scripts.length).toBeGreaterThan(1);

    // Should have hashed filenames for caching
    const hashedScripts = scripts.filter((src) => /\.[a-f0-9]{8,}\./i.test(src));
    expect(hashedScripts.length).toBeGreaterThan(0);
  });

  test('should use font optimization', async ({ page }) => {
    await page.goto('/');

    // Check for font-display: swap
    const fontFaces = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      const fontRules: any[] = [];

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule instanceof CSSFontFaceRule) {
              fontRules.push(rule.style.getPropertyValue('font-display'));
            }
          }
        } catch (e) {
          // CORS - skip
        }
      }

      return fontRules;
    });

    // Should use font-display: swap (if custom fonts used)
    if (fontFaces.length > 0) {
      expect(fontFaces).toContain('swap');
    }
  });

  test('should minimize Time to Interactive (TTI)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for page to be interactive
    await page.waitForLoadState('load');

    // Try to interact with element
    const button = page.locator('[data-testid="currency-selector"]');
    await button.click();

    const interactiveTime = Date.now() - startTime;

    // Should be interactive within 3 seconds
    expect(interactiveTime).toBeLessThan(3000);
  });

  test('should minimize Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Get CLS from performance API
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsValue += (entry as any).value;
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    });

    // CLS should be under 0.1 (good)
    expect(cls).toBeLessThan(0.1);
  });

  test('should use compression for assets', async ({ page, context }) => {
    // Enable request interception to check headers
    await context.route('**/*', (route) => route.continue());

    const response = await page.goto('/');

    // Check if response is compressed
    const encoding = response?.headers()['content-encoding'];

    // Should use gzip or brotli
    expect(encoding === 'gzip' || encoding === 'br').toBeTruthy();
  });
});
