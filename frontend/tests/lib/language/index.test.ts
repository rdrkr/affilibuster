// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for language module barrel exports
 *
 * These tests verify that the language module properly exports
 * all its public APIs through the index file.
 */

import * as LanguageModule from '@/lib/language'

describe('Language Module Exports', () => {
  it('should export getLanguages function', () => {
    expect(LanguageModule.getLanguages).toBeDefined()
    expect(typeof LanguageModule.getLanguages).toBe('function')
  })

  it('should export detectLanguage function', () => {
    expect(LanguageModule.detectLanguage).toBeDefined()
    expect(typeof LanguageModule.detectLanguage).toBe('function')
  })
})
