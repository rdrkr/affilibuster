// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Test Configuration
 *
 * E2E tests are designed to verify CORRECTNESS only, not timing.
 * Performance tests (tagged with @performance) verify timing requirements.
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['**/e2e/**/*.spec.ts', '**/performance/**/*.spec.ts'],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  ...(process.env.CI && { workers: 1 }),
  /*
   * E2E Test Timeout Strategy:
   * - Global timeout is very high (5 minutes) to allow tests to complete regardless of system load
   * - E2E tests verify correctness, not performance - they should pass even on slow/overloaded systems
   * - Performance tests have their own strict timeouts and run separately on production builds
   */
  timeout: 300000, // 5 minutes - E2E tests wait for correctness, not speed

  /* Expect timeout for assertions - reasonable wait for elements to appear */
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* Configure HTML reporter to never auto-serve (prevents blocking in Docker/CI) */
  reporter: [['html', { open: 'never' }]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://localhost:3001',

    /* Ignore HTTPS errors for self-signed certificates in development */
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  /* Only include webServer if SKIP_WEBSERVER is not set */
  ...(process.env.SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: 'NEXT_DEV_OVERLAY=false npm run dev',
          url: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      }),
})
