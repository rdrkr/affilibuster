// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/homepage barrel exports
 */

import * as homepage from '@/components/homepage'

describe('components/homepage barrel exports', () => {
  it('should export HomeSections component', () => {
    expect(homepage.HomeSections).toBeDefined()
  })
})
