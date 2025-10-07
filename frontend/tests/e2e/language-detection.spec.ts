// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for language detection and prompt.
 * Reference: quickstart.md:105-121 (Test 1: Language Detection & Prompt)
 */

import { test, expect } from '@playwright/test';

test.describe('Language Detection', () => {
  test('should detect Italian and show language prompt', async ({ page, context }) => {
    // Set Italian Accept-Language header
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8',
    });

    // Visit homepage
    await page.goto('/');

    // Should show language selection prompt
    const languagePrompt = page.locator('[data-testid="language-prompt"]');
    await expect(languagePrompt).toBeVisible();

    // Should suggest Italian
    await expect(page.locator('text=/italiano/i')).toBeVisible();

    // Should show current language is English
    await expect(page.locator('[data-testid="current-language"]')).toContainText(
      'English'
    );
  });

  test('should not show prompt for English users', async ({ page, context }) => {
    // Set English Accept-Language header
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Visit homepage
    await page.goto('/');

    // Should NOT show language selection prompt
    const languagePrompt = page.locator('[data-testid="language-prompt"]');
    await expect(languagePrompt).not.toBeVisible();
  });

  test('should remember user choice to dismiss prompt', async ({ page, context }) => {
    // Set Italian Accept-Language header
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8',
    });

    // Visit homepage
    await page.goto('/');

    // Dismiss prompt
    const dismissButton = page.locator('[data-testid="dismiss-language-prompt"]');
    await dismissButton.click();

    // Reload page
    await page.reload();

    // Prompt should NOT appear again
    const languagePrompt = page.locator('[data-testid="language-prompt"]');
    await expect(languagePrompt).not.toBeVisible();
  });

  test('should redirect to Italian when user accepts prompt', async ({ page, context }) => {
    // Set Italian Accept-Language header
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8',
    });

    // Visit homepage
    await page.goto('/');

    // Accept Italian
    const acceptButton = page.locator('[data-testid="accept-language-italian"]');
    await acceptButton.click();

    // Should redirect to /it
    await expect(page).toHaveURL(/\/it/);
  });
});
