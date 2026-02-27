// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for SSR environment detection utilities.
 *
 * Verifies that isWindowDefined and isDocumentDefined correctly
 * detect the browser environment in jsdom context.
 */

import { isDocumentDefined, isSecureContext, isWindowDefined } from '@/lib/consent/ssr'

describe('SSR detection utilities', () => {
  describe('isWindowDefined', () => {
    it('should return true when window is available (jsdom)', () => {
      expect(isWindowDefined()).toBe(true)
    })
  })

  describe('isDocumentDefined', () => {
    it('should return true when document is available (jsdom)', () => {
      expect(isDocumentDefined()).toBe(true)
    })
  })

  describe('isSecureContext', () => {
    it('should return false when protocol is not https (jsdom uses about:)', () => {
      // jsdom default protocol is 'about:' which is not HTTPS
      expect(isSecureContext()).toBe(false)
    })

    it('should return false when window is undefined', () => {
      const originalWindow = globalThis.window

      ;(globalThis as any).window = undefined

      expect(isSecureContext()).toBe(false)

      globalThis.window = originalWindow
    })
  })
})
