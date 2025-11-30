// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/call-to-actions barrel exports
 */

import * as cta from '@/components/call-to-actions'

describe('components/call-to-actions barrel exports', () => {
  it('should export NewsletterSignupCTA component', () => {
    expect(cta.NewsletterSignupCTA).toBeDefined()
  })
})
