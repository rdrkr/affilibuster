// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * SSR guard tests for useConsent utilities.
 *
 * Mocks the SSR detection module to simulate server-side rendering,
 * verifying that openCookieSettings, readConsentCookie, and
 * writeConsentCookie handle SSR gracefully without side effects.
 */

import { openCookieSettings, readConsentCookie, writeConsentCookie } from '@/lib/consent/useConsent'
import * as ssr from '@/lib/consent/ssr'

jest.mock('@/lib/consent/api', () => ({
  recordConsent: jest.fn().mockResolvedValue({ success: true, consentId: 'id-1', message: 'ok' }),
}))

jest.mock('@/lib/consent/ssr', () => ({
  isWindowDefined: jest.fn().mockReturnValue(true),
  isDocumentDefined: jest.fn().mockReturnValue(true),
}))

const mockIsWindowDefined = ssr.isWindowDefined as jest.MockedFunction<typeof ssr.isWindowDefined>
const mockIsDocumentDefined = ssr.isDocumentDefined as jest.MockedFunction<typeof ssr.isDocumentDefined>

beforeEach(() => {
  jest.clearAllMocks()
  mockIsWindowDefined.mockReturnValue(true)
  mockIsDocumentDefined.mockReturnValue(true)
})

describe('useConsent SSR guards', () => {
  describe('openCookieSettings', () => {
    it('should return early without dispatching event when window is undefined', () => {
      mockIsWindowDefined.mockReturnValue(false)
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')

      openCookieSettings()

      expect(dispatchEventSpy).not.toHaveBeenCalled()

      dispatchEventSpy.mockRestore()
    })
  })

  describe('readConsentCookie', () => {
    it('should return null when document is undefined', () => {
      mockIsDocumentDefined.mockReturnValue(false)

      const result = readConsentCookie()

      expect(result).toBeNull()
    })
  })

  describe('writeConsentCookie', () => {
    it('should not modify document.cookie when document is undefined', () => {
      mockIsDocumentDefined.mockReturnValue(false)
      const originalCookie = document.cookie

      writeConsentCookie({
        categories: ['necessary'],
        timestamp: '2026-01-01T00:00:00.000Z',
        version: '1.0',
      })

      expect(document.cookie).toBe(originalCookie)
    })
  })
})
