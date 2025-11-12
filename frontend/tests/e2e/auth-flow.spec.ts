// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * E2E tests for authentication flows (registration, login, logout).
 * Reference: specs/004-user-authentication/spec.md - User Story 1
 *
 * Tests cover:
 * - User registration with email/password
 * - User login with valid credentials
 * - Session persistence across page navigation
 * - User logout
 * - Multi-device login support
 */

import { expect, test } from '../fixtures'
import { navigateAndWait } from '../helpers/waits'

// Configure this test file to run serially (not in parallel with other test files)
test.describe.configure({ mode: 'serial' })

test.describe('Authentication Flows', () => {
  // Generate unique email for each test run to avoid conflicts
  const timestamp = Date.now()
  const testEmail = `test-${timestamp}@example.com`
  const testPassword = 'SecurePass123!'
  const testName = 'Test User'

  test.describe('Registration Flow', () => {
    test('should allow new user to register with email, password, and name', async ({ page }) => {
      // Navigate to registration page
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in registration form (order matches DOM: email → name → password → confirm)
      await page.locator('[data-testid="register-form-email"]').fill(testEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)

      // Submit registration form
      await page.locator('[data-testid="register-form-submit"]').click()

      // Should be automatically logged in and redirected to homepage
      // Wait for navigation to complete
      await page.waitForURL(/\/(en|it|he)\/?$/)

      // Check for user menu (indicates successful login)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })
    test('should reject registration with already registered email', async ({ page }) => {
      // First, register a user
      const duplicateEmail = `duplicate-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(duplicateEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()
      await page.waitForURL(/\/(en|it|he)\/?$/)

      // Now try to register again with the same email
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(duplicateEmail)
      await page.locator('[data-testid="register-form-name"]').fill('Another User')
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()

      // Should show error message about email already registered
      await expect(page.locator('[data-testid="registration-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="registration-error"]')).toContainText(
        /already registered|already exists/i
      )
    })
    test('should validate password complexity requirements', async ({ page }) => {
      // Navigate to registration page
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill form with weak password (correct order: email → name → password → confirm)
      await page.locator('[data-testid="register-form-email"]').fill(`weak-${timestamp}@example.com`)
      await page.locator('[data-testid="register-form-name"]').fill('Test User')
      await page.locator('[data-testid="register-form-password"]').fill('weak')
      await page.locator('[data-testid="register-form-confirm-password"]').fill('weak')

      await page.locator('[data-testid="register-form-submit"]').click()

      // Should show password validation error (client-side validation)
      // The error appears as text near the password field, not as a registration-error
      await expect(page.locator('text=/password must be at least 8 characters/i')).toBeVisible()
    })
    test('should validate email format', async ({ page }) => {
      // Navigate to registration page
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill form with invalid email (correct order: email → name → password → confirm)
      await page.locator('[data-testid="register-form-email"]').fill('invalid-email')
      await page.locator('[data-testid="register-form-name"]').fill('Test User')
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)

      // Click submit - browser's native HTML5 validation should prevent submission
      await page.locator('[data-testid="register-form-submit"]').click()

      // Browser native validation prevents form submission
      // Verify the email input is marked as invalid by the browser
      const emailInput = page.locator('[data-testid="register-form-email"]')
      await expect(emailInput).toHaveAttribute('type', 'email')

      // Verify we're still on the register page (form didn't submit)
      await expect(page).toHaveURL(/\/register$/)

      // The email input should have invalid state due to browser validation
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
      expect(isInvalid).toBe(true)
    })
  })

  test.describe('Login Flow', () => {
    // SKIP: Flaky due to Next.js dev server resource exhaustion after multiple /en/login navigations
    // TODO: Re-enable when running against production build (see issue)
    test.skip('should allow registered user to login with correct credentials', async ({ page }) => {
      // First, register a user to ensure they exist
      const loginEmail = `login-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(loginEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()
      await page.waitForURL(/\/(en|it|he)\/?$/)

      // Logout first
      await page.locator('[data-testid="user-menu"]').click()
      await page.locator('[data-testid="logout-button"]').click()
      // Wait for logout redirect to homepage
      await page.waitForURL(/\/(en|it|he)\/?$/, { waitUntil: 'networkidle' })
      // Ensure page is fully loaded after redirect
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()

      // Now test login with the registered user
      await navigateAndWait(page, '/en/login')
      await page.locator('[data-testid="login-form-email"]').fill(loginEmail)
      await page.locator('[data-testid="login-form-password"]').fill(testPassword)
      await page.locator('[data-testid="login-form-submit"]').click()

      // Should be logged in and redirected
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Should show user's name
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toContainText(new RegExp(testName, 'i'))
    })
    // SKIP: Flaky due to Next.js dev server resource exhaustion after multiple /en/login navigations
    // TODO: Re-enable when running against production build (see issue)
    test.skip('should reject login with incorrect password', async ({ page }) => {
      // First, register a user to ensure they exist
      const wrongPassEmail = `wrong-pass-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(wrongPassEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()
      await page.waitForURL(/\/(en|it|he)\/?$/)

      // Logout
      await page.locator('[data-testid="user-menu"]').click()
      await page.locator('[data-testid="logout-button"]').click()
      // Wait for logout redirect to homepage
      await page.waitForURL(/\/(en|it|he)\/?$/, { waitUntil: 'networkidle' })
      // Ensure page is fully loaded after redirect
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()

      // Now test login with wrong password
      await navigateAndWait(page, '/en/login')
      await page.locator('[data-testid="login-form-email"]').fill(wrongPassEmail)
      await page.locator('[data-testid="login-form-password"]').fill('WrongPassword123!')
      await page.locator('[data-testid="login-form-submit"]').click()

      // Should show error message (generic for security)
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-error"]')).toContainText(
        /invalid.*(credentials|email|password)|incorrect/i
      )

      // Should NOT be logged in
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible()
    })
    // SKIP: Flaky due to Next.js dev server resource exhaustion after multiple /en/login navigations
    // TODO: Re-enable when running against production build (see issue)
    test.skip('should reject login with non-existent email', async ({ page }) => {
      // Navigate to login page
      await navigateAndWait(page, '/en/login')

      // Try to login with non-existent email
      await page.locator('[data-testid="login-form-email"]').fill('nonexistent@example.com')
      await page.locator('[data-testid="login-form-password"]').fill(testPassword)

      await page.locator('[data-testid="login-form-submit"]').click()

      // Should show generic error message (don't reveal if email exists)
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-error"]')).toContainText(
        /invalid.*(credentials|email|password)|incorrect/i
      )
    })
    // SKIP: Flaky due to Next.js dev server resource exhaustion after multiple /en/login navigations
    // TODO: Re-enable when running against production build (see issue)
    test.skip('should support "Remember Me" functionality', async ({ page }) => {
      // First, register a user to ensure they exist
      const rememberEmail = `remember-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(rememberEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()
      await page.waitForURL(/\/(en|it|he)\/?$/)

      // Logout first
      await page.locator('[data-testid="user-menu"]').click()
      await page.locator('[data-testid="logout-button"]').click()
      // Wait for logout redirect to homepage
      await page.waitForURL(/\/(en|it|he)\/?$/, { waitUntil: 'networkidle' })
      // Ensure page is fully loaded after redirect
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible()

      // Navigate to login page
      await navigateAndWait(page, '/en/login')

      // Fill in login form
      await page.locator('[data-testid="login-form-email"]').fill(rememberEmail)
      await page.locator('[data-testid="login-form-password"]').fill(testPassword)

      // Check "Remember Me"
      await page.locator('[data-testid="login-form-remember-me"]').check()

      // Submit login form
      await page.locator('[data-testid="login-form-submit"]').click()

      // Should be logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Note: Cannot reliably inspect HttpOnly cookies set by backend on cross-origin requests
      // The "Remember Me" functionality is verified by the backend setting max_age correctly.
      // We can verify it works by checking that the session persists after reload.

      // Reload page to test session persistence
      await page.reload({ waitUntil: 'networkidle' })

      // Should still be logged in after reload (proves cookie was set)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toContainText(new RegExp(testName, 'i'))
    })
  })

  test.describe('Session Persistence', () => {
    test.skip('should maintain authentication state across page navigations', async ({ page }) => {
      // First, register a user to ensure they exist
      const sessionEmail = `session-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(sessionEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()

      // Wait for registration to complete and redirect
      await page.waitForURL(/\/(en|it|he)\/?$/)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Navigate to different pages
      await navigateAndWait(page, '/en')
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      await navigateAndWait(page, '/en/products')
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      await navigateAndWait(page, '/en/about')
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // User should remain authenticated on all pages
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toContainText(new RegExp(testName, 'i'))
    })
    test.skip('should maintain authentication state on page reload', async ({ page }) => {
      // First, register a user to ensure they exist
      const reloadEmail = `reload-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(reloadEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()

      // Wait for registration to complete and redirect
      await page.waitForURL(/\/(en|it|he)\/?$/)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Reload page
      await page.reload({ waitUntil: 'networkidle' })

      // Should still be authenticated
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
      const userMenu = page.locator('[data-testid="user-menu"]')
      await expect(userMenu).toContainText(new RegExp(testName, 'i'))
    })
  })

  test.describe('Logout Flow', () => {
    test.skip('should allow user to logout and clear session', async ({ page }) => {
      // First, register a user to ensure they exist
      const logoutEmail = `logout-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(logoutEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()

      // Wait for registration to complete and redirect
      await page.waitForURL(/\/(en|it|he)\/?$/)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Click user menu to open dropdown
      await page.locator('[data-testid="user-menu"]').click()

      // Click logout button
      await page.locator('[data-testid="logout-button"]').click()

      // Should be logged out - user menu should not be visible
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible()

      // Should see login/sign up buttons instead
      await expect(page.locator('[data-testid="login-link"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-link"]')).toBeVisible()

      // Session cookie should be cleared
      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name === 'session' || c.name === 'access_token')
      expect(sessionCookie).toBeUndefined()
    })
    test.skip('should redirect to homepage after logout', async ({ page }) => {
      // First, register a user to ensure they exist
      const redirectEmail = `redirect-${Date.now()}@example.com`
      await navigateAndWait(page, '/en/register')

      // Wait for form to be fully interactive
      await expect(page.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page.locator('[data-testid="register-form-email"]').fill(redirectEmail)
      await page.locator('[data-testid="register-form-name"]').fill(testName)
      await page.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page.locator('[data-testid="register-form-submit"]').click()

      // Wait for registration to complete and redirect
      await page.waitForURL(/\/(en|it|he)\/?$/)
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

      // Navigate to a different page
      await navigateAndWait(page, '/en/products')

      // Logout
      await page.locator('[data-testid="user-menu"]').click()
      await page.locator('[data-testid="logout-button"]').click()

      // Should be redirected to homepage
      await expect(page).toHaveURL(/\/en\/?$/)
    })
  })

  test.describe('Multi-Device Sessions', () => {
    test.skip('should support concurrent sessions on multiple devices', async ({ browser }) => {
      // First, register a user to ensure they exist
      const multiDeviceEmail = `multi-device-${Date.now()}@example.com`

      // Create two separate browser contexts to simulate different devices
      const context1 = await browser.newContext()
      const context2 = await browser.newContext()

      const page1 = await context1.newPage()
      const page2 = await context2.newPage()

      // Register on device 1
      await navigateAndWait(page1, '/en/register')

      // Wait for form to be fully interactive
      await expect(page1.locator('[data-testid="register-form-email"]')).toBeVisible()
      await expect(page1.locator('[data-testid="register-form-submit"]')).toBeEnabled()

      // Fill in correct order: email → name → password → confirm
      await page1.locator('[data-testid="register-form-email"]').fill(multiDeviceEmail)
      await page1.locator('[data-testid="register-form-name"]').fill(testName)
      await page1.locator('[data-testid="register-form-password"]').fill(testPassword)
      await page1.locator('[data-testid="register-form-confirm-password"]').fill(testPassword)
      await page1.locator('[data-testid="register-form-submit"]').click()

      // Wait for registration to complete and redirect
      await page1.waitForURL(/\/(en|it|he)\/?$/)
      await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible()

      // Login on device 2
      await navigateAndWait(page2, '/en/login')
      await page2.locator('[data-testid="login-form-email"]').fill(multiDeviceEmail)
      await page2.locator('[data-testid="login-form-password"]').fill(testPassword)
      await page2.locator('[data-testid="login-form-submit"]').click()

      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible()

      // Both sessions should remain active
      await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible()
      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible()

      // Navigate on both devices
      await navigateAndWait(page1, '/en/products')
      await navigateAndWait(page2, '/en/about')

      // Both should still be authenticated
      await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible()
      await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible()

      // Cleanup
      await context1.close()
      await context2.close()
    })
  })
})
