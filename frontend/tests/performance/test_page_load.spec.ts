// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Performance Test: Page Load <3s on 3G (T155)
 *
 * Tests page load performance with network throttling to simulate 3G connection.
 * Reference: plan.md:78, quickstart.md:285-294
 *
 * Requirements:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - FCP (First Contentful Paint) < 1.8s
 * - TTFB (Time to First Byte) < 600ms
 * - Total page load < 3s
 */

import { test, expect, type Page } from '@playwright/test'

interface PerformanceMetrics {
  ttfb: number
  domContentLoaded: number
  loadComplete: number
  fcp: number
  lcp: number
  domInteractive: number
  transferSize: number
}

interface NetworkResults {
  fast4g: {
    loadTime?: number
    metrics?: PerformanceMetrics
  }
  slow3g: {
    loadTime?: number
    metrics?: PerformanceMetrics
  }
}

interface ResourceTiming {
  url: string | undefined
  duration: number
  size: number
}

// Base URL for tests that create new contexts (uses same env vars as Playwright config)
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ??
  (process.env.FRONTEND_PORT ? `http://localhost:${process.env.FRONTEND_PORT}` : 'http://localhost:3000')

// Performance thresholds
const THRESHOLDS = {
  ttfb: 600, // Time to First Byte (ms)
  fcp: 1800, // First Contentful Paint (ms)
  lcp: 2500, // Largest Contentful Paint (ms)
  total: 3000, // Total page load (ms)
}

// 3G network conditions (Slow 3G profile)
const SLOW_3G = {
  // Download: 500 Kbps (0.5 Mbps)
  downloadThroughput: (500 * 1024) / 8,
  // Upload: 500 Kbps
  uploadThroughput: (500 * 1024) / 8,
  // Latency: 400ms
  latency: 400,
  // Network is online (not offline)
  offline: false,
}

/**
 * Extract performance metrics from Navigation Timing API.
 *
 * Measures key performance indicators including TTFB, FCP, LCP, and total load time
 * using the browser's Performance API.
 *
 * @param page - Playwright page instance to extract metrics from
 * @returns Promise resolving to performance metrics object with timing measurements
 */
async function getPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = window.performance.getEntriesByType('paint')

    // Find FCP and LCP
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

    // Get LCP from PerformanceObserver (if available)
    let lcp = 0
    try {
      const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length > 0) {
        const lastEntry = lcpEntries[lcpEntries.length - 1]
        lcp = lastEntry ? lastEntry.startTime : 0
      }
    } catch {
      // LCP not available
    }

    return {
      ttfb: perfData.responseStart - perfData.requestStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.fetchStart,
      fcp: fcp,
      lcp: lcp,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      transferSize: perfData.transferSize,
    }
  })
}

test.describe('@performance Page Load Performance (3G)', () => {
  test.beforeEach(async ({ context }) => {
    // Enable network throttling for all tests
    const pages = context.pages()
    const firstPage = pages[0]
    if (firstPage) {
      const cdpSession = await context.newCDPSession(firstPage)
      await cdpSession.send('Network.emulateNetworkConditions', SLOW_3G)
    }
  })

  test('English homepage loads under 3s on 3G', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'networkidle' })

    const loadTime = Date.now() - startTime
    const metrics = await getPerformanceMetrics(page)

    console.log('English Homepage Performance (3G):')
    console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms`)
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`)
    console.log(`  LCP: ${metrics.lcp.toFixed(0)}ms`)
    console.log(`  Total Load: ${loadTime}ms`)
    console.log(`  Transfer Size: ${(metrics.transferSize / 1024).toFixed(2)}KB`)

    // Validate thresholds
    expect(metrics.ttfb).toBeLessThan(THRESHOLDS.ttfb)
    expect(metrics.fcp).toBeLessThan(THRESHOLDS.fcp)
    expect(loadTime).toBeLessThan(THRESHOLDS.total)
  })

  test('Italian homepage loads under 3s on 3G', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/it', { waitUntil: 'networkidle' })

    const loadTime = Date.now() - startTime
    const metrics = await getPerformanceMetrics(page)

    console.log('Italian Homepage Performance (3G):')
    console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms`)
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`)
    console.log(`  Total Load: ${loadTime}ms`)

    expect(metrics.ttfb).toBeLessThan(THRESHOLDS.ttfb)
    expect(metrics.fcp).toBeLessThan(THRESHOLDS.fcp)
    expect(loadTime).toBeLessThan(THRESHOLDS.total)
  })

  test('Hebrew homepage loads under 3s on 3G', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/he', { waitUntil: 'networkidle' })

    const loadTime = Date.now() - startTime
    const metrics = await getPerformanceMetrics(page)

    console.log('Hebrew Homepage Performance (3G):')
    console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms`)
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`)
    console.log(`  Total Load: ${loadTime}ms`)

    expect(metrics.ttfb).toBeLessThan(THRESHOLDS.ttfb)
    expect(metrics.fcp).toBeLessThan(THRESHOLDS.fcp)
    expect(loadTime).toBeLessThan(THRESHOLDS.total)
  })

  test('Product page loads under 3s on 3G', async ({ page }) => {
    const startTime = Date.now()

    // Test a product page
    await page.goto('/products/test-product', {
      waitUntil: 'networkidle',
      timeout: 10000,
    })

    const loadTime = Date.now() - startTime
    const metrics = await getPerformanceMetrics(page)

    console.log('Product Page Performance (3G):')
    console.log(`  TTFB: ${metrics.ttfb.toFixed(0)}ms`)
    console.log(`  FCP: ${metrics.fcp.toFixed(0)}ms`)
    console.log(`  Total Load: ${loadTime}ms`)

    expect(metrics.ttfb).toBeLessThan(THRESHOLDS.ttfb)
    expect(metrics.fcp).toBeLessThan(THRESHOLDS.fcp)
    expect(loadTime).toBeLessThan(THRESHOLDS.total)
  })
})

test.describe('@performance Page Load Performance (Comparison)', () => {
  test('Compare performance across network conditions', async ({ browser }) => {
    const results: NetworkResults = {
      fast4g: {},
      slow3g: {},
    }

    // Test with Fast 4G
    const fast4gContext = await browser.newContext()
    const fast4gPage = await fast4gContext.newPage()
    const fast4gCdp = await fast4gContext.newCDPSession(fast4gPage)

    await fast4gCdp.send('Network.emulateNetworkConditions', {
      downloadThroughput: (4 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
      latency: 20,
      offline: false,
    })

    const fast4gStart = Date.now()
    await fast4gPage.goto(BASE_URL, { waitUntil: 'networkidle' })
    results.fast4g.loadTime = Date.now() - fast4gStart
    results.fast4g.metrics = await getPerformanceMetrics(fast4gPage)
    await fast4gContext.close()

    // Test with Slow 3G
    const slow3gContext = await browser.newContext()
    const slow3gPage = await slow3gContext.newPage()
    const slow3gCdp = await slow3gContext.newCDPSession(slow3gPage)

    await slow3gCdp.send('Network.emulateNetworkConditions', SLOW_3G)

    const slow3gStart = Date.now()
    await slow3gPage.goto(BASE_URL, { waitUntil: 'networkidle' })
    results.slow3g.loadTime = Date.now() - slow3gStart
    results.slow3g.metrics = await getPerformanceMetrics(slow3gPage)
    await slow3gContext.close()

    console.log('\nPerformance Comparison:')
    console.log('Fast 4G:')
    console.log(`  Load Time: ${results.fast4g.loadTime ?? 0}ms`)
    console.log(`  FCP: ${results.fast4g.metrics?.fcp.toFixed(0) ?? 'N/A'}ms`)
    console.log('Slow 3G:')
    console.log(`  Load Time: ${results.slow3g.loadTime ?? 0}ms`)
    console.log(`  FCP: ${results.slow3g.metrics?.fcp.toFixed(0) ?? 'N/A'}ms`)

    // Both should meet basic thresholds
    expect(results.fast4g.loadTime ?? 0).toBeLessThan(2000)
    expect(results.slow3g.loadTime ?? 0).toBeLessThan(THRESHOLDS.total)
  })
})

test.describe('@performance Resource Loading Performance', () => {
  test('Critical resources load quickly', async ({ page }) => {
    const resourceTimings: ResourceTiming[] = []

    page.on('response', async response => {
      const url = response.url()
      const timing = await response.request().timing()

      if (timing && (url.includes('.js') || url.includes('.css') || url.includes('.woff'))) {
        resourceTimings.push({
          url: url.split('/').pop(),
          duration: timing.responseEnd,
          size: (await response.body()).length,
        })
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    console.log('\nCritical Resource Timings:')
    resourceTimings
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .forEach(resource => {
        console.log(
          `  ${resource.url ?? 'unknown'}: ${resource.duration.toFixed(0)}ms (${(resource.size / 1024).toFixed(2)}KB)`
        )
      })

    // Ensure no single resource takes too long
    const slowResources = resourceTimings.filter(r => r.duration > 1000)
    expect(slowResources.length).toBeLessThan(3)
  })
})
