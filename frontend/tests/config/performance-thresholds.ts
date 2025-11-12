// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Performance test thresholds for Affilibuster.
 *
 * These thresholds define the timing requirements for performance tests.
 *
 * E2E tests should NOT use these thresholds - they verify correctness only.
 */

/**
 * Page load timing thresholds in milliseconds.
 * Based on Core Web Vitals and industry best practices.
 */
export const PAGE_LOAD_THRESHOLDS = {
  /** Time to First Byte - server response time */
  TTFB: 600,
  /** First Contentful Paint - first visible content */
  FCP: 1800,
  /** Largest Contentful Paint - main content loaded */
  LCP: 2500,
  /** Total page load time on 3G */
  TOTAL_LOAD: 3000,
  /** DOM Content Loaded event */
  DOM_CONTENT_LOADED: 2000,
} as const

/**
 * Core Web Vitals thresholds.
 */
export const WEB_VITALS_THRESHOLDS = {
  /** Cumulative Layout Shift - visual stability */
  CLS: 0.1,
  /** First Input Delay - interactivity (deprecated, use INP) */
  FID: 100,
  /** Interaction to Next Paint - responsiveness */
  INP: 200,
} as const

/**
 * Performance test timeouts.
 * These are STRICT - performance tests should fail if exceeded.
 */
export const PERFORMANCE_TEST_TIMEOUTS = {
  /** Per-test timeout for performance tests */
  TEST_TIMEOUT: 10000, // 10 seconds
  /** Metric observation window */
  OBSERVATION_WINDOW: 5000, // 5 seconds
  /** Network throttling stabilization */
  NETWORK_STABILIZATION: 2000, // 2 seconds
} as const

/**
 * Network throttling profiles for performance testing.
 */
export const NETWORK_PROFILES = {
  SLOW_3G: {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500 Kbps
    uploadThroughput: (500 * 1024) / 8,
    latency: 400, // 400ms RTT
  },
  FAST_3G: {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8,
    latency: 150, // 150ms RTT
  },
  FAST_4G: {
    offline: false,
    downloadThroughput: (9 * 1024 * 1024) / 8, // 9 Mbps
    uploadThroughput: (1.5 * 1024 * 1024) / 8,
    latency: 60, // 60ms RTT
  },
} as const
