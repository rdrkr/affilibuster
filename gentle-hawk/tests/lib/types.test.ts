// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { LanguageCode, Direction, SUPPORTED_LANGUAGE_CODES, DEFAULT_LANGUAGE_CODE, isLanguageCode } from '@/lib/types'

describe('types', () => {
  describe('LanguageCode', () => {
    it('exposes EN, IT, HE', () => {
      expect(LanguageCode.EN).toBe('en')
      expect(LanguageCode.IT).toBe('it')
      expect(LanguageCode.HE).toBe('he')
    })
  })

  describe('Direction', () => {
    it('exposes LTR and RTL', () => {
      expect(Direction.LTR).toBe('ltr')
      expect(Direction.RTL).toBe('rtl')
    })
  })

  describe('SUPPORTED_LANGUAGE_CODES', () => {
    it('contains all language codes', () => {
      expect(SUPPORTED_LANGUAGE_CODES).toContain('en')
      expect(SUPPORTED_LANGUAGE_CODES).toContain('it')
      expect(SUPPORTED_LANGUAGE_CODES).toContain('he')
    })
  })

  describe('DEFAULT_LANGUAGE_CODE', () => {
    it('is English', () => {
      expect(DEFAULT_LANGUAGE_CODE).toBe('en')
    })
  })

  describe('isLanguageCode', () => {
    it('returns true for valid codes', () => {
      expect(isLanguageCode('en')).toBe(true)
      expect(isLanguageCode('it')).toBe(true)
      expect(isLanguageCode('he')).toBe(true)
    })

    it('returns false for invalid codes', () => {
      expect(isLanguageCode('xx')).toBe(false)
      expect(isLanguageCode('')).toBe(false)
      expect(isLanguageCode('english')).toBe(false)
    })
  })
})
