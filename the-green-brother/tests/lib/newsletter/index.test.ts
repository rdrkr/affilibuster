// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for newsletter barrel exports.
 *
 * Verifies all public API functions are exported.
 */

jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn(),
  getBaseUrl: jest.fn(() => 'https://localhost:8000/v1'),
  getSessionId: jest.fn(() => ''),
}))

import * as newsletter from '@/lib/newsletter'

describe('lib/newsletter barrel exports', () => {
  it('should export subscribeNewsletter function', () => {
    expect(newsletter.subscribeNewsletter).toBeDefined()
    expect(typeof newsletter.subscribeNewsletter).toBe('function')
  })
})
