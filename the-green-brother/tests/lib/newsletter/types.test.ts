// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for newsletter types module.
 *
 * Verifies exported types shape.
 */

import type { SubscribeNewsletterData, UnsubscribeNewsletterData } from '@/lib/newsletter/types'

describe('newsletter types', () => {
  it('should support SubscribeNewsletterData shape', () => {
    const data: SubscribeNewsletterData = {
      body: { email: 'user@example.com' },
      url: '/newsletter/subscribe',
    }

    expect(data.body.email).toBe('user@example.com')
    expect(data.url).toBe('/newsletter/subscribe')
  })

  it('should support UnsubscribeNewsletterData shape', () => {
    const data: UnsubscribeNewsletterData = {
      body: { email: 'user@example.com' },
      url: '/newsletter/unsubscribe',
    }

    expect(data.body.email).toBe('user@example.com')
    expect(data.url).toBe('/newsletter/unsubscribe')
  })
})
