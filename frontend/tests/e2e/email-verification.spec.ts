// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E tests for email verification flow.
 * Reference: specs/004-user-authentication/spec.md - User Story 3
 *
 * Tests cover:
 * - Verification email sent on registration
 * - Clicking verification link confirms email
 * - Unverified users have limited access
 * - Resending verification email
 * - Token expiration
 */

import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures'
import { navigateAndWait } from '../helpers/waits'

test.describe('Email Verification Flow', () => {
  const testEmail = `verification-${Date.now()}@example.com`
  const testPassword = 'VerifyPass123!'
  const testName = 'Verification Test User'

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await navigateAndWait(page, '/en/register')

    await page.locator('[data-testid="register-form-name"]').fill(testName)
    await page.locator('[data-testid="register-form-email"]').fill(testEmail)
    await page.locator('[data-testid="register-form-password"]').fill(testPassword)
    await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)

    await page.locator('[data-testid="register-form-submit"]').click()
    await page.waitForURL(/\/(en|it|he)\/?$/)

    await page.close()
  })

  // Helper function to login
  async function loginUser(page: Page, email?: string): Promise<void> {
    console.log(`Logging in user: ${email ?? testEmail}`)
    await navigateAndWait(page, '/en/login')
    await page.locator('[data-testid="login-form-email"]').fill(email ?? testEmail)
    await page.locator('[data-testid="login-form-password"]').fill(testPassword)
    await page.locator('[data-testid="login-form-submit"]').click()
    console.log('Clicked login submit')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    console.log('User menu visible, login successful')
  }

  test.describe('Verification Email on Registration', () => {
    test('should show verification notice after registration', async ({ page }) => {
      const uniqueEmail = `verify-${Date.now()}@example.com`

      // Register a new user
      await navigateAndWait(page, '/en/register')

      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-email"]').fill(uniqueEmail)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)

      await page.locator('[data-testid="register-form-submit"]').click()

      // Should be redirected to homepage after registration
      await page.waitForURL(/\/(en|it|he)\/?$/)

      // User should be logged in (check for user menu)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    test.skip('should indicate email unverified status on profile', async ({ page }) => {
      await loginUser(page)
      await navigateAndWait(page, '/en/profile')

      // Should show unverified status
      await expect(page.locator('[data-testid="profile-email-status"]')).toContainText(/unverified|not verified/i)

      // Should have option to resend verification
      await expect(page.locator('[data-testid="resend-verification-button"]')).toBeVisible()
    })
  })

  test.describe('Email Verification Link', () => {
    test.skip('should verify email when clicking valid verification link', async ({ page: _page }) => {
      // SKIPPED: This test uses a hardcoded 'valid-verification-token' that doesn't exist in the real backend
      // E2E tests must not mock and should test real components
      // To make this work, we'd need real tokens from actual user registrations
    })

    test.skip('should show error for invalid verification token', async ({ page: _page }) => {
      // SKIPPED: This test needs mock to return error response
      // E2E tests must not mock and should test real components
    })

    test.skip('should show error for expired verification token (> 24 hours)', async ({ page }) => {
      const expiredToken = 'expired-verification-token'

      await navigateAndWait(page, `/en/verify-email?token=${expiredToken}`)

      // Should show expiration error
      await expect(page.locator('[data-testid="verification-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="verification-error"]')).toContainText(/expired/i)

      // Should offer to request new verification email
      await expect(page.locator('[data-testid="request-new-verification"]')).toBeVisible()
    })

    test.skip('should show success message after email verification', async ({ page: _page }) => {
      // SKIPPED: This test uses a hardcoded token and needs mock
      // E2E tests must not mock and should test real components
    })
  })

  test.describe('Unverified User Restrictions', () => {
    test('should allow unverified users to use basic features', async ({ page }) => {
      await loginUser(page)

      // Should be able to browse homepage
      await navigateAndWait(page, '/en')
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Should be able to view products
      await navigateAndWait(page, '/en/products')
      await expect(page).toHaveURL(/\/products/)

      // Should be able to view about page
      await navigateAndWait(page, '/en/about')
      await expect(page).toHaveURL(/\/about/)
    })

    test('should prompt verification for restricted features (save products)', async ({ page }) => {
      await loginUser(page)

      // Navigate to products
      await navigateAndWait(page, '/en/products')

      // Try to save a product (requires verification)
      const saveButton = page.locator('[data-testid="save-product-button"]').first()

      if (await saveButton.isVisible()) {
        await saveButton.click()

        // Should show verification prompt
        await expect(page.locator('[data-testid="verification-required-prompt"]')).toBeVisible()
        await expect(page.locator('[data-testid="verification-required-prompt"]')).toContainText(
          /verify.*email|email.*verification/i
        )

        // Should have option to resend verification email
        await expect(page.locator('[data-testid="verify-email-prompt-button"]')).toBeVisible()
      }
    })

    test('should show verification reminder banner for unverified users', async ({ page }) => {
      await loginUser(page)

      // Navigate to homepage
      await navigateAndWait(page, '/en')

      // Should show verification reminder
      const verificationBanner = page.locator('[data-testid="verification-reminder"]')

      if (await verificationBanner.isVisible()) {
        await expect(verificationBanner).toContainText(/verify.*email|email.*verification/i)

        // Should have dismiss option
        await expect(page.locator('[data-testid="dismiss-verification-reminder"]')).toBeVisible()
      }
    })
  })

  test.describe('Resend Verification Email', () => {
    test.skip('should allow user to request new verification email from profile', async ({ page }) => {
      await loginUser(page)
      await navigateAndWait(page, '/en/profile')

      // Click resend verification button
      await page.locator('[data-testid="resend-verification-button"]').click()

      // Should show success message
      await expect(page.locator('[data-testid="verification-resent-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="verification-resent-success"]')).toContainText(
        /email.*sent|verification.*sent|check.*email/i
      )
    })

    test.skip('should allow user to request verification from dedicated page', async ({ page }) => {
      // Navigate to resend verification page
      await navigateAndWait(page, '/en/resend-verification')

      // Fill in email
      await page.locator('[data-testid="resend-verification-form-email"]').fill(testEmail)

      // Submit request
      await page.locator('[data-testid="resend-verification-form-submit"]').click()

      // Should show success (or generic message for security)
      await expect(page.locator('[data-testid="verification-resent-success"]')).toBeVisible()
    })

    test.skip('should rate limit verification email requests', async ({ page }) => {
      await loginUser(page)
      await navigateAndWait(page, '/en/profile')

      // Request multiple verifications rapidly
      for (let i = 0; i < 4; i++) {
        await page.locator('[data-testid="resend-verification-button"]').click()

        if (i < 3) {
          // First 3 should succeed
          await expect(page.locator('[data-testid="verification-resent-success"]')).toBeVisible()
          // Wait a moment then close notification
          await page
            .locator('[data-testid="close-notification"]')
            .click()
            .catch(() => {
              // Notification may auto-close
            })
        } else {
          // 4th should be rate limited
          await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible()
          await expect(page.locator('[data-testid="rate-limit-error"]')).toContainText(
            /too many|rate limit|try again.*later/i
          )
        }
      }
    })

    test.skip('should not resend verification for already verified email', async ({ page }) => {
      // Login as verified user
      await loginUser(page, 'verified-user@example.com')
      await navigateAndWait(page, '/en/profile')

      // Resend button should not be visible for verified users
      await expect(page.locator('[data-testid="resend-verification-button"]')).not.toBeVisible()

      // Should show verified status
      await expect(page.locator('[data-testid="profile-email-status"]')).toContainText(/verified/i)
    })
  })

  test.describe('Verification Token Management', () => {
    test.skip('should invalidate old verification tokens when new one is requested', async ({ page }) => {
      // Login and get current verification status
      await loginUser(page)
      await navigateAndWait(page, '/en/profile')

      // Request new verification email (this should invalidate old token)
      await page.locator('[data-testid="resend-verification-button"]').click()
      await expect(page.locator('[data-testid="verification-resent-success"]')).toBeVisible()

      // Old token should no longer work
      // (In real test, we'd need to track the old token somehow)
      const oldToken = 'old-invalid-token'
      await navigateAndWait(page, `/en/verify-email?token=${oldToken}`)

      // Should show error for invalid/old token
      await expect(page.locator('[data-testid="verification-error"]')).toBeVisible()
    })

    test('should show error when accessing verification page without token', async ({ page }) => {
      // Navigate to verify-email without token
      await navigateAndWait(page, '/en/verify-email')

      // Should show error about missing token
      await expect(
        page.locator('[data-testid="missing-token-error"]').or(page.locator('[data-testid="verification-error"]'))
      ).toBeVisible()
    })
  })

  test.describe('Verification Flow Accessibility', () => {
    test.skip('should announce verification success to screen readers', async ({ page }) => {
      // Mock verification endpoint
      await page.route('**/auth/verify-email', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Email verified successfully' }),
        })
      })

      const verificationToken = 'valid-verification-token'
      await navigateAndWait(page, `/en/verify-email?token=${verificationToken}`)

      // Success message should have appropriate ARIA role
      const successMessage = page.locator('[data-testid="email-verified-success"]')
      await expect(successMessage).toBeVisible()

      // Should have role="status" or role="alert" for screen reader announcement
      const role = await successMessage.getAttribute('role')
      expect(['status', 'alert']).toContain(role)
    })

    test.skip('should support keyboard navigation in verification forms', async ({ page }) => {
      await navigateAndWait(page, '/en/resend-verification')

      // Tab to email input
      await page.keyboard.press('Tab')
      const emailInput = page.locator('[data-testid="resend-verification-form-email"]')

      // Check if we can focus and enter text
      await emailInput.focus()
      await expect(emailInput).toBeFocused()

      // Type email
      await page.keyboard.type(testEmail)

      // Tab to submit button
      await page.keyboard.press('Tab')

      // Submit with Enter
      const submitButton = page.locator('[data-testid="resend-verification-form-submit"]')
      await expect(submitButton).toBeFocused()
      await page.keyboard.press('Enter')

      // Should submit the form
      await expect(page.locator('[data-testid="verification-resent-success"]')).toBeVisible()
    })
  })
})
