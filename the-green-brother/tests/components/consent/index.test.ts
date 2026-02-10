// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for consent component barrel exports.
 */

import * as consent from '@/components/consent'

describe('components/consent barrel exports', () => {
  it('should export ConsentGate component', () => {
    expect(consent.ConsentGate).toBeDefined()
    expect(typeof consent.ConsentGate).toBe('function')
  })

  it('should export CookieConsentBanner component', () => {
    expect(consent.CookieConsentBanner).toBeDefined()
    expect(typeof consent.CookieConsentBanner).toBe('function')
  })

  it('should export CookieSettingsButton component', () => {
    expect(consent.CookieSettingsButton).toBeDefined()
    expect(typeof consent.CookieSettingsButton).toBe('function')
  })
})
