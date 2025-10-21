// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for currency selection and persistence.
 * Reference: quickstart.md:150-168 (Test 3: Currency Selection & Persistence)
 */

import { test, expect } from '@playwright/test'

test.describe('Currency Selection', () => {
  test('should display default currency based on language', async ({ page }) => {
    // English -> USD
    await page.goto('/')
    const currencySelector = page.locator('[data-testid="currency-selector"]')
    await expect(currencySelector).toContainText('USD')

    // Italian -> EUR
    await page.goto('/it')
    await expect(currencySelector).toContainText('EUR')

    // Hebrew -> ILS
    await page.goto('/he')
    await expect(currencySelector).toContainText('ILS')
  })

  test('should allow manual currency change', async ({ page }) => {
    // Visit homepage
    await page.goto('/')

    // Open currency selector
    await page.locator('[data-testid="currency-selector"]').click()

    // Select EUR
    await page.locator('[data-testid="currency-option-EUR"]').click()

    // Currency should update
    await expect(page.locator('[data-testid="currency-selector"]')).toContainText('EUR')

    // Prices should update to EUR
    const price = page.locator('[data-testid="price"]').first()
    if (await price.isVisible()) {
      await expect(price).toContainText('€')
    }
  })

  test('should persist currency choice across pages', async ({ page }) => {
    // Visit homepage and change to GBP
    await page.goto('/')
    await page.locator('[data-testid="currency-selector"]').click()
    await page.locator('[data-testid="currency-option-GBP"]').click()

    // Navigate to products page
    await page.goto('/products')

    // Currency should still be GBP
    await expect(page.locator('[data-testid="currency-selector"]')).toContainText('GBP')
  })

  test('should persist currency choice on reload', async ({ page }) => {
    // Visit homepage and change to EUR
    await page.goto('/')
    await page.locator('[data-testid="currency-selector"]').click()
    await page.locator('[data-testid="currency-option-EUR"]').click()

    // Reload page
    await page.reload()

    // Currency should still be EUR
    await expect(page.locator('[data-testid="currency-selector"]')).toContainText('EUR')
  })

  test('should convert prices when currency changes', async ({ page }) => {
    // Visit product page
    await page.goto('/products/test-product')

    // Get original USD price
    const originalPrice = await page.locator('[data-testid="price"]').first().textContent()
    const usdAmount = parseFloat(originalPrice?.replace(/[^0-9.]/g, '') || '0')

    // Change to EUR
    await page.locator('[data-testid="currency-selector"]').click()
    await page.locator('[data-testid="currency-option-EUR"]').click()

    // Wait for price update
    await page.waitForTimeout(500)

    // Get EUR price
    const eurPrice = await page.locator('[data-testid="price"]').first().textContent()
    const eurAmount = parseFloat(eurPrice?.replace(/[^0-9.]/g, '') || '0')

    // EUR amount should be different from USD (exchange rate applied)
    expect(eurAmount).not.toBe(usdAmount)
    expect(eurAmount).toBeGreaterThan(0)

    // Should show EUR symbol
    await expect(page.locator('[data-testid="price"]').first()).toContainText('€')
  })

  test('should format prices according to locale', async ({ page }) => {
    // Italian locale uses comma for decimal
    await page.goto('/it')

    // Select EUR currency
    await page.locator('[data-testid="currency-selector"]').click()
    await page.locator('[data-testid="currency-option-EUR"]').click()

    // Price should use Italian formatting
    const price = page.locator('[data-testid="price"]').first()
    if (await price.isVisible()) {
      const priceText = await price.textContent()

      // Italian: "29,99 €" (comma as decimal, space before symbol)
      expect(priceText).toMatch(/\d+,\d+/) // Comma decimal
    }
  })

  test('should show all supported currencies in selector', async ({ page }) => {
    await page.goto('/')

    // Open currency selector
    await page.locator('[data-testid="currency-selector"]').click()

    // Should have all supported currencies
    const currencies = ['USD', 'EUR', 'ILS', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']

    for (const currency of currencies) {
      const option = page.locator(`[data-testid="currency-option-${currency}"]`)
      await expect(option).toBeVisible()
    }
  })
})
