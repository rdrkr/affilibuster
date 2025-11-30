// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { expect, type Page } from '@playwright/test'

/**
 * Helper functions for handling modals and prompts in E2E tests.
 *
 * These helpers encapsulate common modal interaction patterns
 * to reduce code duplication across tests.
 */

/**
 * Dismiss the language prompt if it appears.
 * The language prompt appears when browser language differs from page language.
 * @param page - Playwright page object
 */
export async function dismissLanguagePrompt(page: Page): Promise<void> {
  const prompt = page.locator('[data-testid="language-prompt"]')

  // Check if prompt is visible
  const isVisible = await prompt.isVisible().catch(() => false)

  if (isVisible) {
    // Click dismiss button - wait for it to be visible first (especially on mobile)
    const dismissButton = page.locator('[data-testid="dismiss-language-prompt"]')
    await expect(dismissButton).toBeVisible()
    // Use force:true to bypass backdrop that may intercept pointer events
    await dismissButton.click({ force: true })

    // Wait for prompt to disappear
    await expect(prompt).not.toBeVisible()
  }
}

/**
 * Accept the language prompt and switch to suggested language.
 * @param page - Playwright page object
 */
export async function acceptLanguagePrompt(page: Page): Promise<void> {
  const prompt = page.locator('[data-testid="language-prompt"]')

  // Check if prompt is visible
  const isVisible = await prompt.isVisible().catch(() => false)

  if (isVisible) {
    // Click accept button - wait for it to be visible first (especially on mobile)
    const acceptButton = page.locator('[data-testid="accept-language-prompt"]')
    await expect(acceptButton).toBeVisible()
    // Use force:true to bypass backdrop that may intercept pointer events
    await acceptButton.click({ force: true })

    // Wait for prompt to disappear
    await expect(prompt).not.toBeVisible()
  }
}

/**
 * Ensure no modal backdrop is blocking interactions.
 * Use before clicking elements that might be covered by modal backdrops.
 * @param page - Playwright page object
 */
export async function ensureNoModalBackdrop(page: Page): Promise<void> {
  // Check for modal backdrop with specific class pattern (overlay/backdrop)
  const backdrop = page.locator('.fixed.inset-0.bg-black\\/50, [data-testid="modal-backdrop"]').first()

  // If backdrop exists and is visible, try to dismiss by pressing Escape
  const isVisible = await backdrop.isVisible().catch(() => false)

  if (isVisible) {
    // Try pressing Escape to close the modal
    await page.keyboard.press('Escape')

    // Wait briefly for backdrop to disappear
    await expect(backdrop)
      .not.toBeVisible({ timeout: 5000 })
      .catch(() => {
        // If still visible after Escape, the test should continue
        // The actual test will fail with a clearer error if the element is blocked
      })
  }
}

/**
 * Handle any modal that might appear on page load.
 * Combines language prompt dismissal and backdrop clearing.
 * @param page - Playwright page object
 */
export async function handlePageModals(page: Page): Promise<void> {
  await dismissLanguagePrompt(page)
  await ensureNoModalBackdrop(page)
}

/**
 * Wait for and close a generic modal by its close button.
 * @param page - Playwright page object
 * @param modalTestId - Test ID of the modal container
 * @param closeButtonTestId - Test ID of the close button
 */
export async function closeModal(page: Page, modalTestId: string, closeButtonTestId: string): Promise<void> {
  const modal = page.locator(`[data-testid="${modalTestId}"]`)

  // Wait for modal to be visible
  await expect(modal).toBeVisible()

  // Click close button
  const closeButton = page.locator(`[data-testid="${closeButtonTestId}"]`)
  await closeButton.click()

  // Wait for modal to disappear
  await expect(modal).not.toBeVisible()
}
