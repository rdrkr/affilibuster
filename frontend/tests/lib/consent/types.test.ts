// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for consent types module.
 *
 * Verifies exported constants and type re-exports.
 */

import { CONSENT_COOKIE_EXPIRY_DAYS, CONSENT_COOKIE_NAME, type ConsentCookieValue } from '@/lib/consent/types'

describe('consent types', () => {
  it('should export CONSENT_COOKIE_NAME as cc_consent', () => {
    expect(CONSENT_COOKIE_NAME).toBe('cc_consent')
  })

  it('should export CONSENT_COOKIE_EXPIRY_DAYS as 365', () => {
    expect(CONSENT_COOKIE_EXPIRY_DAYS).toBe(365)
  })

  it('should support ConsentCookieValue shape', () => {
    const value: ConsentCookieValue = {
      categories: ['necessary', 'analytics'],
      timestamp: '2026-01-01T00:00:00.000Z',
      version: '1.0',
    }

    expect(value.categories).toHaveLength(2)
    expect(value.timestamp).toBeDefined()
    expect(value.version).toBe('1.0')
  })
})
