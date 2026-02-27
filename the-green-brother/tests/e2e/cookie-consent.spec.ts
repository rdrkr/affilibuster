// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E tests for cookie consent banner and GDPR compliance.
 * Reference: GDPR Articles 5-7, 25 (consent, data protection by design)
 *
 * Tests cover:
 * - Cookie consent banner display
 * - Cookie preferences (customize)
 * - Consent acceptance/rejection
 * - Consent persistence across sessions
 * - Consent withdrawal (GDPR Art. 7(3))
 * - Do Not Track respect
 * - Cookie policy page
 */

import { expect, test } from '../fixtures'
import { navigateAndWait, waitForHidden } from '../helpers/waits'
import { handlePageModals } from '../helpers/modals'

/** Cookie name used by the consent system. */
const CONSENT_COOKIE_NAME = 'cc_consent'

test.describe('Cookie Consent', () => {
  // ========================================
  // CONSENT BANNER DISPLAY
  // ========================================
  test.describe('Consent Banner', () => {
    test('should display cookie consent banner on first visit', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
    })

    test('should show banner at bottom of page', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
      // Banner should be at the bottom (fixed positioning)
      const box = await banner.boundingBox()
      const viewport = page.viewportSize()
      expect(box).toBeTruthy()
      expect(viewport).toBeTruthy()
      // Banner bottom edge should be near the viewport bottom
      if (box && viewport) {
        expect(box.y + box.height).toBeGreaterThan(viewport.height * 0.5)
      }
    })

    test('should not block page content', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
      // Main page content should still be visible/accessible
      const main = page.locator('main').first()
      await expect(main).toBeVisible()
    })

    test('should show consent message in user language', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
      // Banner should contain CMS-driven text (not empty)
      const bannerText = await banner.textContent()
      expect(bannerText).toBeTruthy()
      expect(bannerText!.length).toBeGreaterThan(10)
    })

    test('should include link to cookie policy', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
      // Look for a link containing "cookie" in the banner
      const cookiePolicyLink = banner.getByRole('link', { name: /cookie/i })
      await expect(cookiePolicyLink).toBeVisible()
    })

    test('should include link to privacy policy', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
      // Look for a link containing "privacy" in the banner
      const privacyLink = banner.getByRole('link', { name: /privacy/i })
      await expect(privacyLink).toBeVisible()
    })
  })

  // ========================================
  // CONSENT ACTIONS
  // ========================================
  test.describe('Consent Actions', () => {
    test('should have "Accept All" button', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await expect(acceptBtn).toBeVisible()
    })

    test('should have "Reject All" button', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const rejectBtn = banner.getByRole('button', { name: /reject all/i })
      await expect(rejectBtn).toBeVisible()
    })

    test('should have "Customize" button', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const customizeBtn = banner.getByRole('button', { name: /customize/i })
      await expect(customizeBtn).toBeVisible()
    })

    test('should save consent on "Accept All"', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()

      // Banner should dismiss
      await waitForHidden(banner)

      // Consent cookie should be set
      const cookies = await page.context().cookies()
      const consentCookie = cookies.find(c => c.name === CONSENT_COOKIE_NAME)
      expect(consentCookie).toBeTruthy()

      // Cookie value should contain accepted categories
      const value = JSON.parse(decodeURIComponent(consentCookie!.value))
      expect(value.categories).toBeTruthy()
      expect(value.categories.length).toBeGreaterThan(1) // More than just "necessary"
      expect(value.timestamp).toBeTruthy()
    })

    test('should save rejection on "Reject All"', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const rejectBtn = banner.getByRole('button', { name: /reject all/i })
      await rejectBtn.click()

      // Banner should dismiss
      await waitForHidden(banner)

      // Consent cookie should be set with only necessary category
      const cookies = await page.context().cookies()
      const consentCookie = cookies.find(c => c.name === CONSENT_COOKIE_NAME)
      expect(consentCookie).toBeTruthy()

      const value = JSON.parse(decodeURIComponent(consentCookie!.value))
      // After rejection, only the mandatory/necessary category should remain
      expect(value.categories.length).toBe(1)
    })

    test('should hide banner after consent', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()

      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()

      await waitForHidden(banner)
    })
  })

  // ========================================
  // COOKIE PREFERENCES
  // ========================================
  test.describe('Cookie Preferences', () => {
    test('should show cookie categories when customizing', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const customizeBtn = banner.getByRole('button', { name: /customize/i })
      await customizeBtn.click()

      // Settings panel should appear
      const settingsPanel = page.getByTestId('settings-panel')
      await expect(settingsPanel).toBeVisible()

      // Should have checkboxes for cookie categories
      const checkboxes = settingsPanel.getByRole('checkbox')
      const count = await checkboxes.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('should show "Necessary" cookies always enabled', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const customizeBtn = banner.getByRole('button', { name: /customize/i })
      await customizeBtn.click()

      const settingsPanel = page.getByTestId('settings-panel')
      await expect(settingsPanel).toBeVisible()

      // Required category checkbox should be checked and disabled
      const checkboxes = settingsPanel.getByRole('checkbox')
      const firstCheckbox = checkboxes.first()
      await expect(firstCheckbox).toBeChecked()
      await expect(firstCheckbox).toBeDisabled()
    })

    test('should allow toggling optional categories', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const customizeBtn = banner.getByRole('button', { name: /customize/i })
      await customizeBtn.click()

      const settingsPanel = page.getByTestId('settings-panel')
      await expect(settingsPanel).toBeVisible()

      // Find an optional (enabled) checkbox and toggle it
      const checkboxes = settingsPanel.getByRole('checkbox')
      const count = await checkboxes.count()

      // At least one optional category should exist
      let foundOptional = false
      for (let i = 0; i < count; i++) {
        const cb = checkboxes.nth(i)
        const isDisabled = await cb.isDisabled()
        if (!isDisabled) {
          foundOptional = true
          // Toggle it
          const wasBefore = await cb.isChecked()
          await cb.click()
          const isAfter = await cb.isChecked()
          expect(isAfter).not.toBe(wasBefore)
          break
        }
      }
      expect(foundOptional).toBe(true)
    })

    test('should show description for each cookie category', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const customizeBtn = banner.getByRole('button', { name: /customize/i })
      await customizeBtn.click()

      const settingsPanel = page.getByTestId('settings-panel')
      await expect(settingsPanel).toBeVisible()

      // Settings panel should have descriptive text beyond just checkbox labels
      const panelText = await settingsPanel.textContent()
      expect(panelText).toBeTruthy()
      expect(panelText!.length).toBeGreaterThan(50)
    })

    test('should save custom preferences', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const customizeBtn = banner.getByRole('button', { name: /customize/i })
      await customizeBtn.click()

      // Click Save Preferences
      const saveBtn = banner.getByRole('button', { name: /save preferences/i })
      await expect(saveBtn).toBeVisible()
      await saveBtn.click()

      // Banner should dismiss
      await waitForHidden(banner)

      // Consent cookie should be set
      const cookies = await page.context().cookies()
      const consentCookie = cookies.find(c => c.name === CONSENT_COOKIE_NAME)
      expect(consentCookie).toBeTruthy()
    })
  })

  // ========================================
  // CONSENT PERSISTENCE
  // ========================================
  test.describe('Consent Persistence', () => {
    test('should store consent in cookies', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      const cookies = await page.context().cookies()
      const consentCookie = cookies.find(c => c.name === CONSENT_COOKIE_NAME)
      expect(consentCookie).toBeTruthy()
      expect(consentCookie!.path).toBe('/')
    })

    test('should not show banner again after consent', async ({ page }) => {
      // First visit: accept consent
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      // Navigate to another page
      await navigateAndWait(page, '/en')
      await handlePageModals(page)

      // Banner should NOT reappear
      const bannerAgain = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(bannerAgain).not.toBeVisible()
    })

    test('should persist consent cookie structure', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      const cookies = await page.context().cookies()
      const consentCookie = cookies.find(c => c.name === CONSENT_COOKIE_NAME)
      expect(consentCookie).toBeTruthy()

      // Validate cookie structure
      const value = JSON.parse(decodeURIComponent(consentCookie!.value))
      expect(value).toHaveProperty('categories')
      expect(value).toHaveProperty('timestamp')
      expect(value).toHaveProperty('version')
      expect(Array.isArray(value.categories)).toBe(true)
    })
  })

  // ========================================
  // TRACKING BASED ON CONSENT
  // ========================================
  test.describe('Tracking Enforcement', () => {
    // Affilibuster currently uses zero third-party tracking (no GA, no marketing pixels).
    // These tests verify that no tracking scripts load regardless of consent state.

    test('should not load any third-party tracking scripts', async ({ page }) => {
      await navigateAndWait(page, '/en')

      // Accept all cookies
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      // Verify no GA or marketing scripts are loaded
      const gaScript = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(
          s =>
            s.src.includes('googletagmanager') ||
            s.src.includes('google-analytics') ||
            s.src.includes('facebook') ||
            s.src.includes('doubleclick')
        )
      })
      expect(gaScript).toBe(false)
    })

    test('should not set any third-party cookies', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      // Reload and check cookies
      await navigateAndWait(page, '/en')
      const cookies = await page.context().cookies()

      // All cookies should be first-party (same domain)
      const thirdPartyCookies = cookies.filter(
        c => !c.domain.includes('localhost') && !c.domain.includes('127.0.0.1') && c.domain !== ''
      )
      expect(thirdPartyCookies).toHaveLength(0)
    })
  })

  // ========================================
  // CONSENT WITHDRAWAL (GDPR Art. 7(3))
  // ========================================
  test.describe('Consent Withdrawal', () => {
    test('should show consent settings in footer', async ({ page }) => {
      // First, accept consent to dismiss banner
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      // Footer should have a cookie settings link/button
      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      const settingsLink = footer
        .getByRole('button', { name: /cookie/i })
        .or(footer.getByRole('link', { name: /cookie/i }))
      await expect(settingsLink).toBeVisible()
    })

    test('should allow reopening consent settings from footer', async ({ page }) => {
      // Accept consent first
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      // Click footer cookie settings link
      const footer = page.locator('footer')
      const settingsLink = footer
        .getByRole('button', { name: /cookie/i })
        .or(footer.getByRole('link', { name: /cookie/i }))
      await settingsLink.click()

      // Banner should reappear in edit mode with settings panel open
      const reopenedBanner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(reopenedBanner).toBeVisible()

      // Settings panel should be auto-opened for withdrawal
      const settingsPanel = page.getByTestId('settings-panel')
      await expect(settingsPanel).toBeVisible()
    })

    test('should allow modifying consent after initial acceptance', async ({ page }) => {
      // Accept all first
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      const acceptBtn = banner.getByRole('button', { name: /accept all/i })
      await acceptBtn.click()
      await waitForHidden(banner)

      // Reopen settings from footer
      const footer = page.locator('footer')
      const settingsLink = footer
        .getByRole('button', { name: /cookie/i })
        .or(footer.getByRole('link', { name: /cookie/i }))
      await settingsLink.click()

      const reopenedBanner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(reopenedBanner).toBeVisible()

      // Click "Reject All" to withdraw consent
      const rejectBtn = reopenedBanner.getByRole('button', { name: /reject all/i })
      await rejectBtn.click()
      await waitForHidden(reopenedBanner)

      // Verify consent was updated to only necessary
      const cookies = await page.context().cookies()
      const consentCookie = cookies.find(c => c.name === CONSENT_COOKIE_NAME)
      expect(consentCookie).toBeTruthy()
      const value = JSON.parse(decodeURIComponent(consentCookie!.value))
      expect(value.categories.length).toBe(1) // Only necessary
    })
  })

  // ========================================
  // DO NOT TRACK
  // ========================================
  test.describe('Do Not Track', () => {
    test('should show DNT notice when DNT is enabled', async ({ browser }) => {
      // Create a context with DNT header
      const context = await browser.newContext({
        extraHTTPHeaders: { DNT: '1' },
      })
      const page = await context.newPage()

      // Set DNT via JS (since the hook reads navigator.doNotTrack)
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' })
      })

      await navigateAndWait(page, '/en')

      // Banner should show DNT notice
      const dntNotice = page.getByTestId('dnt-notice')
      await expect(dntNotice).toBeVisible()

      await context.close()
    })
  })

  // ========================================
  // COOKIE POLICY PAGE
  // ========================================
  test.describe('Cookie Policy', () => {
    test('should have dedicated cookie policy page', async ({ page }) => {
      await navigateAndWait(page, '/en/cookie-policy')
      // Page should load without 404
      await expect(page.locator('main')).toBeVisible()
      const heading = page.getByRole('heading').first()
      await expect(heading).toBeVisible()
    })

    test('should have content on cookie policy page', async ({ page }) => {
      await navigateAndWait(page, '/en/cookie-policy')
      const main = page.locator('main')
      await expect(main).toBeVisible()
      // Page should have substantial content about cookies
      const text = await main.textContent()
      expect(text).toBeTruthy()
      expect(text!.length).toBeGreaterThan(100)
    })
  })

  // ========================================
  // REGIONAL COMPLIANCE
  // ========================================
  test.describe('Regional Compliance', () => {
    // Note: Affilibuster does not currently implement geo-based consent variations.
    // The consent banner shows for ALL visitors (strictest compliance - GDPR for everyone).
    // These tests verify the universal consent approach.

    test('should show consent banner regardless of visitor location', async ({ page }) => {
      await navigateAndWait(page, '/en')
      const banner = page.getByRole('dialog', { name: /cookie consent/i })
      await expect(banner).toBeVisible()
    })

    test('should support consent in Italian locale', async ({ page }) => {
      await navigateAndWait(page, '/it')
      const banner = page.getByRole('dialog')
      await expect(banner).toBeVisible()
      // Should have CMS-driven Italian content
      const bannerText = await banner.textContent()
      expect(bannerText).toBeTruthy()
      expect(bannerText!.length).toBeGreaterThan(10)
    })
  })
})
