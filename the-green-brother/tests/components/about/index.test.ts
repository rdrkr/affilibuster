// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for about components barrel export
 */

import * as aboutExports from '@/components/about'

describe('about barrel exports', () => {
  it('should export AboutSections component', () => {
    expect(aboutExports.AboutSections).toBeDefined()
  })
})
