// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for preferences module barrel exports
 *
 * These tests verify that the preferences module properly exports
 * all its public APIs through the index file.
 */

import * as PreferencesModule from '@/lib/preferences'

describe('Preferences Module Exports', () => {
  it('should export getUserPreferences function', () => {
    expect(PreferencesModule.getUserPreferences).toBeDefined()
    expect(typeof PreferencesModule.getUserPreferences).toBe('function')
  })

  it('should export updateUserPreferences function', () => {
    expect(PreferencesModule.updateUserPreferences).toBeDefined()
    expect(typeof PreferencesModule.updateUserPreferences).toBe('function')
  })
})
