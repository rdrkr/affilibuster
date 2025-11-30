// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/user-preferences barrel exports
 */

import * as userPreferences from '@/lib/user-preferences'

describe('lib/user-preferences barrel exports', () => {
  it('should export getUserPreferences function', () => {
    expect(userPreferences.getUserPreferences).toBeDefined()
    expect(typeof userPreferences.getUserPreferences).toBe('function')
  })

  it('should export updateUserPreferences function', () => {
    expect(userPreferences.updateUserPreferences).toBeDefined()
    expect(typeof userPreferences.updateUserPreferences).toBe('function')
  })
})
