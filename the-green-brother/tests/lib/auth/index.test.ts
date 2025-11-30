// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/auth barrel exports
 */

import * as auth from '@/lib/auth'

describe('lib/auth barrel exports', () => {
  it('should export login function', () => {
    expect(auth.login).toBeDefined()
    expect(typeof auth.login).toBe('function')
  })

  it('should export register function', () => {
    expect(auth.register).toBeDefined()
    expect(typeof auth.register).toBe('function')
  })

  it('should export logout function', () => {
    expect(auth.logout).toBeDefined()
    expect(typeof auth.logout).toBe('function')
  })

  it('should export ApiError class', () => {
    expect(auth.ApiError).toBeDefined()
  })
})
