// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for consent component barrel exports.
 */

import * as consent from '@/components/consent'

describe('components/consent barrel exports', () => {
  it('should export CookieConsentBanner component', () => {
    expect(consent.CookieConsentBanner).toBeDefined()
    expect(typeof consent.CookieConsentBanner).toBe('function')
  })

  it('should export CookieSettingsAction component', () => {
    expect(consent.CookieSettingsAction).toBeDefined()
    expect(typeof consent.CookieSettingsAction).toBe('function')
  })

  it('should export DeferredCookieConsentBanner component', () => {
    expect(consent.DeferredCookieConsentBanner).toBeDefined()
    expect(typeof consent.DeferredCookieConsentBanner).toBe('function')
  })
})
