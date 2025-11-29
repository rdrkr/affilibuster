// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Helper functions for waiting in E2E tests.
 *
 * These helpers wait for CONDITIONS, not TIME.
 * E2E tests should verify correctness, not performance.
 * Use these instead of explicit timeouts like `page.waitForTimeout()`.
 */

/**
 * Wait for page to be fully hydrated and interactive.
 * Use this after navigation to ensure React components are ready.
 *
 * @param page - Playwright page object
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle')
}

/**
 * Wait for an element to be visible and return the locator.
 * Prefer this over explicit timeout waits.
 *
 * @param locator - Element locator
 * @returns The same locator after visibility is confirmed
 */
export async function waitForElement(locator: Locator): Promise<Locator> {
  await expect(locator).toBeVisible()
  return locator
}

/**
 * Wait for element to contain specific text.
 * Use this instead of waitForTimeout when waiting for content to load.
 *
 * @param locator - Element locator
 * @param text - Text pattern to wait for
 */
export async function waitForText(locator: Locator, text: string | RegExp): Promise<void> {
  await expect(locator).toContainText(text)
}

/**
 * Navigate to a page and wait for hydration.
 * Standard navigation pattern for E2E tests.
 *
 * @param page - Playwright page object
 * @param url - URL to navigate to
 */
export async function navigateAndWait(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' })
}

/**
 * Wait for a dropdown or menu to be fully open.
 * Use after clicking a dropdown trigger.
 *
 * @param optionLocator - Locator for an option that should be visible when open
 */
export async function waitForDropdownOpen(optionLocator: Locator): Promise<void> {
  await expect(optionLocator).toBeVisible()
}

/**
 * Wait for navigation to complete after clicking a link.
 * Use with Promise.all for click + navigation.
 *
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to wait for
 * @param clickAction - Function that triggers navigation
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  clickAction: () => Promise<void>
): Promise<void> {
  await Promise.all([page.waitForURL(urlPattern), clickAction()])
}

/**
 * Wait for element to be attached to DOM.
 * Use when element might not be visible but needs to exist.
 *
 * @param locator - Element locator
 */
export async function waitForAttached(locator: Locator): Promise<void> {
  await expect(locator).toBeAttached()
}

/**
 * Wait for element to disappear.
 * Use when waiting for modals, loading states, etc. to close.
 *
 * @param locator - Element locator
 */
export async function waitForHidden(locator: Locator): Promise<void> {
  await expect(locator).not.toBeVisible()
}
