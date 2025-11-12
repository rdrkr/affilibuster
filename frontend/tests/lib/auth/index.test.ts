// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for auth barrel export (index.ts)
 * Ensures all auth exports are available
 */

import * as authExports from '@/lib/auth'

describe('lib/auth index', () => {
  it('should export AuthContext', () => {
    expect(authExports.AuthContext).toBeDefined()
  })

  it('should export AuthProvider', () => {
    expect(authExports.AuthProvider).toBeDefined()
  })

  it('should export useAuth hook', () => {
    expect(authExports.useAuth).toBeDefined()
  })

  it('should export all auth API functions', () => {
    expect(authExports.login).toBeDefined()
    expect(authExports.register).toBeDefined()
    expect(authExports.logout).toBeDefined()
    expect(authExports.forgotPassword).toBeDefined()
    expect(authExports.resetPassword).toBeDefined()
    expect(authExports.verifyEmail).toBeDefined()
    expect(authExports.resendVerification).toBeDefined()
    expect(authExports.refresh).toBeDefined()
    expect(authExports.updateProfile).toBeDefined()
  })
})
