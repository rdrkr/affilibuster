// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/health barrel exports
 */

import * as health from '@/lib/health'

describe('lib/health barrel exports', () => {
  it('should export checkHealth function', () => {
    expect(health.checkHealth).toBeDefined()
    expect(typeof health.checkHealth).toBe('function')
  })
})
