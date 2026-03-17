// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for consent barrel exports.
 *
 * Verifies all public API functions, types, constants, and hooks are exported.
 */

jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn(),
  getBaseUrl: jest.fn(() => 'https://localhost:8000/v1'),
  getSessionId: jest.fn(() => ''),
}))

import * as consent from '@/lib/consent'

describe('lib/consent barrel exports', () => {
  it('should export getConsentPage function', () => {
    expect(consent.getConsentPage).toBeDefined()
    expect(typeof consent.getConsentPage).toBe('function')
  })

  it('should export getConsentCategories function', () => {
    expect(consent.getConsentCategories).toBeDefined()
    expect(typeof consent.getConsentCategories).toBe('function')
  })

  it('should export recordConsent function', () => {
    expect(consent.recordConsent).toBeDefined()
    expect(typeof consent.recordConsent).toBe('function')
  })

  it('should export useConsent hook', () => {
    expect(consent.useConsent).toBeDefined()
    expect(typeof consent.useConsent).toBe('function')
  })

  it('should export CONSENT_COOKIE_NAME constant', () => {
    expect(consent.CONSENT_COOKIE_NAME).toBe('cc_consent')
  })

  it('should export CONSENT_COOKIE_EXPIRY_DAYS constant', () => {
    expect(consent.CONSENT_COOKIE_EXPIRY_DAYS).toBe(365)
  })

  it('should export OPEN_COOKIE_SETTINGS_EVENT constant', () => {
    expect(consent.OPEN_COOKIE_SETTINGS_EVENT).toBe('affilibuster:open-cookie-settings')
  })

  it('should export openCookieSettings function', () => {
    expect(consent.openCookieSettings).toBeDefined()
    expect(typeof consent.openCookieSettings).toBe('function')
  })

  it('should export readConsentCookie function', () => {
    expect(consent.readConsentCookie).toBeDefined()
    expect(typeof consent.readConsentCookie).toBe('function')
  })

  it('should export writeConsentCookie function', () => {
    expect(consent.writeConsentCookie).toBeDefined()
    expect(typeof consent.writeConsentCookie).toBe('function')
  })

  it('should export isWindowDefined function', () => {
    expect(consent.isWindowDefined).toBeDefined()
    expect(typeof consent.isWindowDefined).toBe('function')
  })

  it('should export isDocumentDefined function', () => {
    expect(consent.isDocumentDefined).toBeDefined()
    expect(typeof consent.isDocumentDefined).toBe('function')
  })
})
