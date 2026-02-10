// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/types.ts
 */

import { LanguageCode as GeneratedLanguageCode } from '@/lib/generated/types.gen'
import {
  CurrencyCode,
  DEFAULT_LANGUAGE_CODE,
  Direction,
  isLanguageCode,
  LanguageCode,
  SUPPORTED_LANGUAGE_CODES,
} from '@/lib/types'

describe('types module', () => {
  describe('LanguageCode', () => {
    it('should export EN language code', () => {
      expect(LanguageCode.EN).toBe(GeneratedLanguageCode.EN)
    })

    it('should export IT language code', () => {
      expect(LanguageCode.IT).toBe(GeneratedLanguageCode.IT)
    })

    it('should export HE language code', () => {
      expect(LanguageCode.HE).toBe(GeneratedLanguageCode.HE)
    })
  })

  describe('Direction', () => {
    it('should export LTR direction', () => {
      expect(Direction.LTR).toBe('ltr')
    })

    it('should export RTL direction', () => {
      expect(Direction.RTL).toBe('rtl')
    })
  })

  describe('CurrencyCode', () => {
    it('should export USD currency code', () => {
      expect(CurrencyCode.USD).toBe('USD')
    })

    it('should export EUR currency code', () => {
      expect(CurrencyCode.EUR).toBe('EUR')
    })

    it('should export ILS currency code', () => {
      expect(CurrencyCode.ILS).toBe('ILS')
    })
  })

  describe('SUPPORTED_LANGUAGE_CODES', () => {
    it('should be an array of language codes', () => {
      expect(Array.isArray(SUPPORTED_LANGUAGE_CODES)).toBe(true)
    })

    it('should include english', () => {
      expect(SUPPORTED_LANGUAGE_CODES).toContain(LanguageCode.EN)
    })

    it('should include italian', () => {
      expect(SUPPORTED_LANGUAGE_CODES).toContain(LanguageCode.IT)
    })

    it('should include hebrew', () => {
      expect(SUPPORTED_LANGUAGE_CODES).toContain(LanguageCode.HE)
    })
  })

  describe('DEFAULT_LANGUAGE_CODE', () => {
    it('should be english (en)', () => {
      expect(DEFAULT_LANGUAGE_CODE).toBe(LanguageCode.EN)
    })
  })

  describe('isLanguageCode', () => {
    it('should return true for valid language code (en)', () => {
      expect(isLanguageCode(LanguageCode.EN)).toBe(true)
    })

    it('should return true for valid language code (it)', () => {
      expect(isLanguageCode(LanguageCode.IT)).toBe(true)
    })

    it('should return true for valid language code (he)', () => {
      expect(isLanguageCode(LanguageCode.HE)).toBe(true)
    })

    it('should return false for invalid language code', () => {
      expect(isLanguageCode('xx')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isLanguageCode('')).toBe(false)
    })

    it('should return false for random string', () => {
      expect(isLanguageCode('invalid')).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(isLanguageCode('EN')).toBe(false)
      expect(isLanguageCode('IT')).toBe(false)
    })
  })
})
