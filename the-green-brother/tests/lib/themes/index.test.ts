// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/themes barrel exports
 */

import * as themes from '@/lib/themes'

describe('lib/themes barrel exports', () => {
  it('should export getThemes function', () => {
    expect(themes.getThemes).toBeDefined()
    expect(typeof themes.getThemes).toBe('function')
  })

  it('should export getThemeById function', () => {
    expect(themes.getThemeById).toBeDefined()
    expect(typeof themes.getThemeById).toBe('function')
  })
})
