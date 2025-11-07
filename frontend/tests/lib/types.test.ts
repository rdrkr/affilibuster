// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for type utility functions
 * Tests type guards and helper functions in lib/types
 */

import {
  isLanguageCode,
  getDirectionForLanguage,
  LanguageCode,
  Direction,
  SUPPORTED_LANGUAGE_CODES,
  LANGUAGE_DIRECTION_MAP,
  DEFAULT_LANGUAGE_CODE,
} from '@/lib/types'

describe('lib/types', () => {
  describe('isLanguageCode', () => {
    it('should return true for valid English language code', () => {
      expect(isLanguageCode('en')).toBe(true)
    })

    it('should return true for valid Italian language code', () => {
      expect(isLanguageCode('it')).toBe(true)
    })

    it('should return true for valid Hebrew language code', () => {
      expect(isLanguageCode('he')).toBe(true)
    })

    it('should return false for invalid language code', () => {
      expect(isLanguageCode('fr')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isLanguageCode('')).toBe(false)
    })

    it('should return false for random string', () => {
      expect(isLanguageCode('invalid')).toBe(false)
    })

    it('should return false for uppercase language code', () => {
      expect(isLanguageCode('EN')).toBe(false)
    })

    it('should work with all supported language codes', () => {
      SUPPORTED_LANGUAGE_CODES.forEach(code => {
        expect(isLanguageCode(code)).toBe(true)
      })
    })
  })

  describe('getDirectionForLanguage', () => {
    it('should return LTR for English', () => {
      expect(getDirectionForLanguage(LanguageCode.EN)).toBe(Direction.LTR)
    })

    it('should return LTR for Italian', () => {
      expect(getDirectionForLanguage(LanguageCode.IT)).toBe(Direction.LTR)
    })

    it('should return RTL for Hebrew', () => {
      expect(getDirectionForLanguage(LanguageCode.HE)).toBe(Direction.RTL)
    })

    it('should return correct direction from LANGUAGE_DIRECTION_MAP', () => {
      Object.entries(LANGUAGE_DIRECTION_MAP).forEach(([code, direction]) => {
        expect(getDirectionForLanguage(code as LanguageCode)).toBe(direction)
      })
    })
  })

  describe('constants', () => {
    it('should have SUPPORTED_LANGUAGE_CODES with all language codes', () => {
      expect(SUPPORTED_LANGUAGE_CODES).toContain(LanguageCode.EN)
      expect(SUPPORTED_LANGUAGE_CODES).toContain(LanguageCode.IT)
      expect(SUPPORTED_LANGUAGE_CODES).toContain(LanguageCode.HE)
      expect(SUPPORTED_LANGUAGE_CODES).toHaveLength(3)
    })

    it('should have DEFAULT_LANGUAGE_CODE set to English', () => {
      expect(DEFAULT_LANGUAGE_CODE).toBe(LanguageCode.EN)
    })

    it('should have LANGUAGE_DIRECTION_MAP with all supported languages', () => {
      SUPPORTED_LANGUAGE_CODES.forEach(code => {
        expect(LANGUAGE_DIRECTION_MAP[code]).toBeDefined()
        expect([Direction.LTR, Direction.RTL]).toContain(LANGUAGE_DIRECTION_MAP[code])
      })
    })
  })

  describe('enum exports', () => {
    it('should export LanguageCode enum with correct values', () => {
      expect(LanguageCode.EN).toBe('en')
      expect(LanguageCode.IT).toBe('it')
      expect(LanguageCode.HE).toBe('he')
    })

    it('should export Direction enum with correct values', () => {
      expect(Direction.LTR).toBe('ltr')
      expect(Direction.RTL).toBe('rtl')
    })

    it('should allow Object.values() on LanguageCode enum', () => {
      const values = Object.values(LanguageCode)
      expect(values).toContain('en')
      expect(values).toContain('it')
      expect(values).toContain('he')
    })
  })
})
