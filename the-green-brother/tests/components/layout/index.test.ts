// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/layout barrel exports
 */

import * as layout from '@/components/layout'

describe('components/layout barrel exports', () => {
  it('should export DynamicZone component', () => {
    expect(layout.DynamicZone).toBeDefined()
  })
})
