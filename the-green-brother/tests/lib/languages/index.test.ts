// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/languages barrel exports
 */

import * as languages from '@/lib/languages'

describe('lib/languages barrel exports', () => {
  it('should export getLanguages function', () => {
    expect(languages.getLanguages).toBeDefined()
    expect(typeof languages.getLanguages).toBe('function')
  })

  it('should export detectLanguage function', () => {
    expect(languages.detectLanguage).toBeDefined()
    expect(typeof languages.detectLanguage).toBe('function')
  })
})
