// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for SSR environment detection utilities.
 *
 * Verifies that isWindowDefined and isDocumentDefined correctly
 * detect the browser environment in jsdom context.
 */

import { isDocumentDefined, isWindowDefined } from '@/lib/consent/ssr'

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
})
