// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/redirects barrel exports
 */

import * as redirects from '@/lib/redirects'

describe('lib/redirects barrel exports', () => {
  it('should export checkRedirect function', () => {
    expect(redirects.checkRedirect).toBeDefined()
    expect(typeof redirects.checkRedirect).toBe('function')
  })
})
