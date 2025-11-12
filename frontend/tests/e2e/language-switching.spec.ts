// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for manual language switching.
 * Reference: quickstart.md:123-148 (Test 2: Manual Language Switch)
 */

import { expect, test } from '../fixtures'
import { CodeEnum } from '@/lib/generated/types.gen'
import { navigateAndWait } from '../helpers/waits'

test.describe('Language Switching', () => {
  test('should switch from English to Italian', async ({ page }) => {
    // Start on English homepage
    await navigateAndWait(page, '/en')

    // Verify English content is displayed
    const englishHeroTitle = page.locator('h1').first()
    await expect(englishHeroTitle).toBeVisible()
    const englishText = await englishHeroTitle.textContent()

    // Navigate directly to Italian version
    await navigateAndWait(page, '/it')

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
    await navigateAndWait(page, '/en')

    // Verify English content is displayed
    const englishHeroTitle = page.locator('h1').first()
    await expect(englishHeroTitle).toBeVisible()
    const englishText = await englishHeroTitle.textContent()

    // Navigate directly to Hebrew version
    await navigateAndWait(page, '/he')

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
    // Navigate to Italian homepage
    await navigateAndWait(page, '/it')

    await expect(page).toHaveURL(/\/it/)
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.IT)

    // Navigate to About page directly
    await navigateAndWait(page, '/it/about')

    // Should still be in Italian
    await expect(page).toHaveURL(/\/it\/about/)
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.IT)
  })

  test('should show correct language in selector after switch', async ({ page }) => {
    // Navigate to Italian page
    await navigateAndWait(page, '/it')

    // Selector should show Italian as current
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await expect(languageSelector).toContainText(/italiano/i)
  })

  test('should preserve query parameters when switching language', async ({ page }) => {
    // Visit Italian page with query parameters
    await navigateAndWait(page, '/it?utm_source=test&utm_campaign=test')

    // Query parameters should be preserved in the URL
    await expect(page).toHaveURL(/\/it/)
    await expect(page).toHaveURL(/utm_source=test/)
    await expect(page).toHaveURL(/utm_campaign=test/)

    // Verify content is in Italian with query params intact
    await expect(page.locator('html')).toHaveAttribute('lang', CodeEnum.IT)
  })
})
