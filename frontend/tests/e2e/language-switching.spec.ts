// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for manual language switching.
 * Reference: quickstart.md:123-148 (Test 2: Manual Language Switch)
 */

import { expect, test } from '@playwright/test'
import { CodeEnum } from '@/lib/generated/types.gen'

test.describe('Language Switching', () => {
  test('should switch from English to Italian', async ({ page }) => {
    // Start on English homepage
    await page.goto('/')

    // Verify English content is displayed
    await page.waitForLoadState('networkidle')
    const englishHeroTitle = page.locator('h1').first()
    await expect(englishHeroTitle).toBeVisible()
    const englishText = await englishHeroTitle.textContent()

    // Open language selector
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await languageSelector.click()

    // Select Italian
    const italianOption = page.locator('[data-testid="language-option-it"]')
    await italianOption.click()

    // Should redirect to /it
    await expect(page).toHaveURL(/\/it/)

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Content should be in Italian (layout attribute)
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.IT)

    // Verify actual content changed to Italian (not the same as English)
    const italianHeroTitle = page.locator('h1').first()
    await expect(italianHeroTitle).toBeVisible()
    const italianText = await italianHeroTitle.textContent()

    // Content should be different from English
    expect(italianText).not.toBe(englishText)
  })

  test('should switch from English to Hebrew (RTL)', async ({ page }) => {
    // Start on English homepage
    await page.goto('/')

    // Verify English content is displayed
    await page.waitForLoadState('networkidle')
    const englishHeroTitle = page.locator('h1').first()
    await expect(englishHeroTitle).toBeVisible()
    const englishText = await englishHeroTitle.textContent()

    // Open language selector
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await languageSelector.click()

    // Select Hebrew
    const hebrewOption = page.locator('[data-testid="language-option-he"]')
    await hebrewOption.click()

    // Should redirect to /he
    await expect(page).toHaveURL(/\/he/)

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Content should be in Hebrew (layout attribute)
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.HE)

    // Should have RTL direction
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

    // Verify actual content changed to Hebrew (not the same as English)
    const hebrewHeroTitle = page.locator('h1').first()
    await expect(hebrewHeroTitle).toBeVisible()
    const hebrewText = await hebrewHeroTitle.textContent()

    // Content should be different from English
    expect(hebrewText).not.toBe(englishText)
  })

  test('should persist language choice across navigation', async ({ page }) => {
    // Switch to Italian
    await page.goto('/')
    await page.locator('[data-testid="language-selector"]').click()
    await page.locator('[data-testid="language-option-it"]').click()

    await expect(page).toHaveURL(/\/it/)

    // Navigate to different page
    await page.locator('a[href*="/about"]').first().click()

    // Should still be in Italian
    await expect(page).toHaveURL(/\/it/)
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.IT)
  })

  test('should show correct language in selector after switch', async ({ page }) => {
    // Start on English
    await page.goto('/')

    // Switch to Italian
    await page.locator('[data-testid="language-selector"]').click()
    await page.locator('[data-testid="language-option-it"]').click()

    // Selector should show Italian as current
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await expect(languageSelector).toContainText(/italiano|italian/i)
  })

  test('should preserve query parameters when switching language', async ({ page }) => {
    // Visit page with query parameters
    await page.goto('/?utm_source=test&utm_campaign=test')

    // Switch language
    await page.locator('[data-testid="language-selector"]').click()
    await page.locator('[data-testid="language-option-it"]').click()

    // Query parameters should be preserved
    await expect(page).toHaveURL(/utm_source=test/)
    await expect(page).toHaveURL(/utm_campaign=test/)
  })
})
