// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Web Vitals Measurement Tests (T155A)
 *
 * Measures Core Web Vitals metrics for all pages in all languages.
 * Reference: plan.md:79-82 (LCP <2.5s, FCP <1.8s, CLS <0.1)
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): < 2.5s (Good)
 * - FID (First Input Delay): < 100ms (Good)
 * - CLS (Cumulative Layout Shift): < 0.1 (Good)
 * - FCP (First Contentful Paint): < 1.8s (Good)
 * - TTFB (Time to First Byte): < 600ms (Good)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

// Google's "Good" thresholds
const WEB_VITALS_THRESHOLDS = {
  lcp: 2500,    // Largest Contentful Paint (ms)
  fid: 100,     // First Input Delay (ms)
  cls: 0.1,     // Cumulative Layout Shift (score)
  fcp: 1800,    // First Contentful Paint (ms)
  ttfb: 600,    // Time to First Byte (ms)
  inp: 200,     // Interaction to Next Paint (ms)
};

interface WebVitalsMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  inp?: number;
}

/**
 * Capture Web Vitals using Performance Observer API
 */
async function captureWebVitals(page: any): Promise<WebVitalsMetrics> {
  return await page.evaluate(() => {
    return new Promise<WebVitalsMetrics>((resolve) => {
      const metrics: Partial<WebVitalsMetrics> = {};
      let metricsCollected = 0;
      const totalMetrics = 5; // LCP, FID, CLS, FCP, TTFB

      const checkComplete = () => {
        if (metricsCollected >= totalMetrics) {
          resolve(metrics as WebVitalsMetrics);
        }
      };

      // Capture LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Capture FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!metrics.fid) {
            metrics.fid = entry.processingStart - entry.startTime;
            metricsCollected++;
            checkComplete();
          }
        });
      });
      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // FID may not be available
        metrics.fid = 0;
        metricsCollected++;
      }

      // Capture CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        metrics.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Capture FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
            metricsCollected++;
            checkComplete();
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      // Capture TTFB
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        metricsCollected++;
        checkComplete();
      }

      // Get final LCP after 5 seconds
      setTimeout(() => {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lastLcp = lcpEntries[lcpEntries.length - 1] as any;
          metrics.lcp = lastLcp.renderTime || lastLcp.loadTime;
          metricsCollected++;
        }

        // Get final CLS
        metricsCollected++;

        checkComplete();
      }, 5000);
    });
  });
}

test.describe('Web Vitals - English Pages', () => {
  test('Homepage meets Web Vitals thresholds', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    const metrics = await captureWebVitals(page);

    console.log('\nEnglish Homepage Web Vitals:');
    console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms (threshold: ${WEB_VITALS_THRESHOLDS.lcp}ms)`);
    console.log(`  FID: ${metrics.fid.toFixed(0)}ms (threshold: ${WEB_VITALS_THRESHOLDS.fid}ms)`);
    console.log(`  CLS: ${metrics.cls.toFixed(3)} (threshold: ${WEB_VITALS_THRESHOLDS.cls})`);
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms (threshold: ${WEB_VITALS_THRESHOLDS.fcp}ms)`);
    console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms (threshold: ${WEB_VITALS_THRESHOLDS.ttfb}ms)`);

    // Validate all metrics
    expect(metrics.lcp).toBeLessThan(WEB_VITALS_THRESHOLDS.lcp);
    expect(metrics.cls).toBeLessThan(WEB_VITALS_THRESHOLDS.cls);
    expect(metrics.fcp).toBeLessThan(WEB_VITALS_THRESHOLDS.fcp);
    expect(metrics.ttfb).toBeLessThan(WEB_VITALS_THRESHOLDS.ttfb);
  });

  test('Product page meets Web Vitals thresholds', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/test-product`);
    await page.waitForLoadState('networkidle');

    const metrics = await captureWebVitals(page);

    console.log('\nProduct Page Web Vitals:');
    console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms`);
    console.log(`  CLS: ${metrics.cls.toFixed(3)}`);
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`);

    expect(metrics.lcp).toBeLessThan(WEB_VITALS_THRESHOLDS.lcp);
    expect(metrics.cls).toBeLessThan(WEB_VITALS_THRESHOLDS.cls);
    expect(metrics.fcp).toBeLessThan(WEB_VITALS_THRESHOLDS.fcp);
  });
});

test.describe('Web Vitals - Italian Pages', () => {
  test('Italian homepage meets Web Vitals thresholds', async ({ page }) => {
    await page.goto(`${BASE_URL}/it`);
    await page.waitForLoadState('networkidle');

    const metrics = await captureWebVitals(page);

    console.log('\nItalian Homepage Web Vitals:');
    console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms`);
    console.log(`  CLS: ${metrics.cls.toFixed(3)}`);
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`);

    expect(metrics.lcp).toBeLessThan(WEB_VITALS_THRESHOLDS.lcp);
    expect(metrics.cls).toBeLessThan(WEB_VITALS_THRESHOLDS.cls);
    expect(metrics.fcp).toBeLessThan(WEB_VITALS_THRESHOLDS.fcp);
  });
});

test.describe('Web Vitals - Hebrew Pages (RTL)', () => {
  test('Hebrew homepage meets Web Vitals thresholds', async ({ page }) => {
    await page.goto(`${BASE_URL}/il`);
    await page.waitForLoadState('networkidle');

    const metrics = await captureWebVitals(page);

    console.log('\nHebrew Homepage Web Vitals (RTL):');
    console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms`);
    console.log(`  CLS: ${metrics.cls.toFixed(3)}`);
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`);

    expect(metrics.lcp).toBeLessThan(WEB_VITALS_THRESHOLDS.lcp);
    expect(metrics.cls).toBeLessThan(WEB_VITALS_THRESHOLDS.cls);
    expect(metrics.fcp).toBeLessThan(WEB_VITALS_THRESHOLDS.fcp);
  });

  test('RTL layout does not cause excessive layout shifts', async ({ page }) => {
    await page.goto(`${BASE_URL}/il`);
    await page.waitForLoadState('networkidle');

    const metrics = await captureWebVitals(page);

    // RTL layouts can sometimes cause layout shifts
    // Ensure it's still within "Good" threshold
    expect(metrics.cls).toBeLessThan(WEB_VITALS_THRESHOLDS.cls);
  });
});

test.describe('Web Vitals - Interactive Elements', () => {
  test('Language switcher interaction has low delay', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Measure interaction delay for language switcher
    const startTime = Date.now();

    // Click language switcher
    await page.click('[data-testid="language-switcher"]', { timeout: 5000 }).catch(() => {
      // Fallback if data-testid not found
      page.click('button:has-text("English")');
    });

    const interactionDelay = Date.now() - startTime;

    console.log(`\nLanguage Switcher Interaction Delay: ${interactionDelay}ms`);

    // Should respond within 200ms (INP threshold)
    expect(interactionDelay).toBeLessThan(WEB_VITALS_THRESHOLDS.inp);
  });

  test('Currency selector interaction has low delay', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    await page.click('[data-testid="currency-selector"]', { timeout: 5000 }).catch(() => {
      // Fallback
      page.click('button:has-text("USD")');
    });

    const interactionDelay = Date.now() - startTime;

    console.log(`\nCurrency Selector Interaction Delay: ${interactionDelay}ms`);

    expect(interactionDelay).toBeLessThan(WEB_VITALS_THRESHOLDS.inp);
  });
});

test.describe('Web Vitals - Comparison Report', () => {
  test('Generate Web Vitals report for all languages', async ({ page }) => {
    const results: { [key: string]: WebVitalsMetrics } = {};

    const pages = [
      { name: 'English', url: BASE_URL },
      { name: 'Italian', url: `${BASE_URL}/it` },
      { name: 'Hebrew', url: `${BASE_URL}/il` },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      results[pageInfo.name] = await captureWebVitals(page);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('Web Vitals Comparison Report');
    console.log('═══════════════════════════════════════');

    Object.entries(results).forEach(([pageName, metrics]) => {
      console.log(`\n${pageName}:`);
      console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms ${metrics.lcp < WEB_VITALS_THRESHOLDS.lcp ? '✓' : '✗'}`);
      console.log(`  FID: ${metrics.fid.toFixed(0)}ms ${metrics.fid < WEB_VITALS_THRESHOLDS.fid ? '✓' : '✗'}`);
      console.log(`  CLS: ${metrics.cls.toFixed(3)} ${metrics.cls < WEB_VITALS_THRESHOLDS.cls ? '✓' : '✗'}`);
      console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms ${metrics.fcp < WEB_VITALS_THRESHOLDS.fcp ? '✓' : '✗'}`);
      console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms ${metrics.ttfb < WEB_VITALS_THRESHOLDS.ttfb ? '✓' : '✗'}`);
    });

    console.log('\n═══════════════════════════════════════\n');

    // All pages should pass
    Object.values(results).forEach((metrics) => {
      expect(metrics.lcp).toBeLessThan(WEB_VITALS_THRESHOLDS.lcp);
      expect(metrics.cls).toBeLessThan(WEB_VITALS_THRESHOLDS.cls);
      expect(metrics.fcp).toBeLessThan(WEB_VITALS_THRESHOLDS.fcp);
    });
  });
});
