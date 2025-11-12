// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for auth components barrel export (index.ts)
 * Ensures all auth component exports are available
 */

import * as authComponents from '@/components/auth'

describe('components/auth index', () => {
  it('should export LoginForm', () => {
    expect(authComponents.LoginForm).toBeDefined()
  })

  it('should export RegisterForm', () => {
    expect(authComponents.RegisterForm).toBeDefined()
  })

  it('should export ForgotPasswordForm', () => {
    expect(authComponents.ForgotPasswordForm).toBeDefined()
  })

  it('should export ResetPasswordForm', () => {
    expect(authComponents.ResetPasswordForm).toBeDefined()
  })

  it('should export ResendVerificationForm', () => {
    expect(authComponents.ResendVerificationForm).toBeDefined()
  })

  it('should export ProfileForm', () => {
    expect(authComponents.ProfileForm).toBeDefined()
  })
})
