// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E test for currency selection and persistence.
 * Reference: quickstart.md:150-168 (Test 3: Currency Selection & Persistence)
 */

import { expect, test } from '../fixtures'
import { CurrencyCode } from '@/lib/generated/types.gen'
import { navigateAndWait, waitForDropdownOpen } from '../helpers/waits'

test.describe('Currency Selection', () => {
  test('should display default currency based on language', async ({ page }) => {
    // English -> USD
    await navigateAndWait(page, '/')

    const currencySelector = page.locator('[data-testid="currency-selector"]')
    // Wait for currency selector to be visible and hydrated with actual content
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)
    // Verify it shows USD for English
    await expect(currencySelector).toContainText(CurrencyCode.USD)

    // Italian -> EUR
    await navigateAndWait(page, '/it')
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)
    await expect(currencySelector).toContainText(CurrencyCode.EUR)

    // Hebrew -> ILS
    await navigateAndWait(page, '/he')
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)
    await expect(currencySelector).toContainText(CurrencyCode.ILS)
  })

  test('should allow manual currency change', async ({ page }) => {
    // Visit homepage
    await navigateAndWait(page, '/')

    // Wait for currency selector to be ready with actual content (not loading placeholder)
    const currencySelector = page.locator('[data-testid="currency-selector"]')
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)

    // Open currency selector
    await currencySelector.click()

    // Wait for dropdown menu to be visible before selecting option
    const eurOption = page.locator('[data-testid="currency-option-EUR"]')
    await waitForDropdownOpen(eurOption)

    // Select EUR
    await eurOption.click()

    // Currency should update
    await expect(currencySelector).toContainText(CurrencyCode.EUR)

    // Prices should update to EUR
    const price = page.locator('[data-testid="price"]').first()
    if (await price.isVisible()) {
      await expect(price).toContainText('€')
    }
  })

  test('should persist currency choice across pages', async ({ page }) => {
    // Visit homepage and change to GBP
    await navigateAndWait(page, '/')

    // Wait for currency selector to be ready with actual content (not loading placeholder)
    const currencySelector = page.locator('[data-testid="currency-selector"]')
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)

    // Open currency selector
    await currencySelector.click()

    // Wait for dropdown menu to be visible before selecting option
    const gbpOption = page.locator('[data-testid="currency-option-GBP"]')
    await waitForDropdownOpen(gbpOption)

    // Select GBP
    await gbpOption.click()

    // Wait for currency to update
    await expect(currencySelector).toContainText(CurrencyCode.GBP)

    // Navigate to products page (need language prefix)
    await navigateAndWait(page, '/en/products')

    // Wait for currency selector to be visible and hydrated on new page
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS|GBP/)

    // Currency should still be GBP
    await expect(currencySelector).toContainText(CurrencyCode.GBP)
  })

  test('should persist currency choice on reload', async ({ page }) => {
    // Visit homepage and change to EUR
    await navigateAndWait(page, '/')

    // Wait for currency selector to be ready with actual content (not loading placeholder)
    const currencySelector = page.locator('[data-testid="currency-selector"]')
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)

    // Open currency selector
    await currencySelector.click()

    // Wait for dropdown menu to be visible before selecting option
    const eurOption = page.locator('[data-testid="currency-option-EUR"]')
    await waitForDropdownOpen(eurOption)

    // Select EUR
    await eurOption.click()

    // Wait for currency to update
    await expect(currencySelector).toContainText(CurrencyCode.EUR)

    // Reload page and wait for navigation to be ready
    await page.reload({ waitUntil: 'networkidle' })

    // Wait for currency selector to be visible and hydrated after reload
    await expect(currencySelector).toBeVisible()
    await expect(currencySelector).toContainText(/USD|EUR|ILS/)

    // Currency should still be EUR
    await expect(currencySelector).toContainText(CurrencyCode.EUR)
  })

  // Skipped: Currency conversion is thoroughly tested in unit tests (exchange-rates.test.ts, Price.test.tsx)
  // E2E environment lacks product pages with price elements for integration testing
  test.skip('should convert prices when currency changes', async ({ page }) => {
    // Visit product page
    await navigateAndWait(page, '/products/test-product')

    // Get original USD price
    const originalPrice = await page.locator('[data-testid="price"]').first().textContent()
    const usdAmount = parseFloat(originalPrice?.replace(/[^0-9.]/g, '') ?? '0')

    // Change to EUR
    await page.locator('[data-testid="currency-selector"]').click()
    const eurOption = page.locator('[data-testid="currency-option-EUR"]')
    await waitForDropdownOpen(eurOption)
    await eurOption.click()

    // Wait for price to update by checking for EUR symbol
    await expect(page.locator('[data-testid="price"]').first()).toContainText('€')

    // Get EUR price
    const eurPrice = await page.locator('[data-testid="price"]').first().textContent()
    const eurAmount = parseFloat(eurPrice?.replace(/[^0-9.]/g, '') ?? '0')

    // EUR amount should be different from USD (exchange rate applied)
    expect(eurAmount).not.toBe(usdAmount)
    expect(eurAmount).toBeGreaterThan(0)
  })

  // Skipped: Locale-specific price formatting is tested in unit tests (Price.test.tsx)
  // E2E environment lacks pages with price elements for integration testing
  test.skip('should format prices according to locale', async ({ page }) => {
    // Italian locale uses comma for decimal
    await navigateAndWait(page, '/it')

    // Select EUR currency
    await page.locator('[data-testid="currency-selector"]').click()
    const eurOption = page.locator('[data-testid="currency-option-EUR"]')
    await waitForDropdownOpen(eurOption)
    await eurOption.click()

    // Wait for currency to update
    const currencySelector = page.locator('[data-testid="currency-selector"]')
    await expect(currencySelector).toContainText(CurrencyCode.EUR)

    // Price should use Italian formatting
    const price = page.locator('[data-testid="price"]').first()
    if (await price.isVisible()) {
      const priceText = await price.textContent()

      // Italian: "29,99 €" (comma as decimal, space before symbol)
      expect(priceText).toMatch(/\d+,\d+/) // Comma decimal
    }
  })

  test('should show all supported currencies in selector', async ({ page }) => {
    await navigateAndWait(page, '/')

    // Open currency selector
    await page.locator('[data-testid="currency-selector"]').click()

    // Check all currencies are present
    Object.values(CurrencyCode).forEach(currency => {
      const option = page.locator(`[data-testid="currency-option-${currency}"]`)
      expect(option).toBeVisible()
    })
  })
})
