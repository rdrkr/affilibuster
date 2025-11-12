// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for localStorage utilities
 */

import {
  STORAGE_KEYS,
  getCurrency,
  setCurrency,
  removeCurrency,
  getLanguage,
  setLanguage,
  removeLanguage,
} from '@/lib/core/storage'
import { CurrencyCode } from '@/lib/types'

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('STORAGE_KEYS', () => {
    it('should have correct storage key constants', () => {
      expect(STORAGE_KEYS.CURRENCY).toBe('affilibuster_currency')
      expect(STORAGE_KEYS.LANGUAGE).toBe('affilibuster_language')
    })
  })

  describe('getCurrency', () => {
    it('should return null when no currency is stored', () => {
      expect(getCurrency()).toBeNull()
    })

    it('should return stored currency code', () => {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, CurrencyCode.EUR)
      expect(getCurrency()).toBe(CurrencyCode.EUR)
    })

    it('should return currency code for all supported currencies', () => {
      const currencies = [
        CurrencyCode.USD,
        CurrencyCode.EUR,
        CurrencyCode.ILS,
        CurrencyCode.GBP,
        CurrencyCode.CAD,
        CurrencyCode.AUD,
        CurrencyCode.JPY,
        CurrencyCode.CNY,
      ]

      currencies.forEach(currency => {
        localStorage.setItem(STORAGE_KEYS.CURRENCY, currency)
        expect(getCurrency()).toBe(currency)
      })
    })
  })

  describe('setCurrency', () => {
    it('should save currency code to localStorage', () => {
      setCurrency(CurrencyCode.USD)
      expect(localStorage.getItem(STORAGE_KEYS.CURRENCY)).toBe(CurrencyCode.USD)
    })

    it('should overwrite existing currency', () => {
      setCurrency(CurrencyCode.USD)
      setCurrency(CurrencyCode.EUR)
      expect(getCurrency()).toBe(CurrencyCode.EUR)
    })

    it('should save all supported currency codes', () => {
      const currencies = [
        CurrencyCode.USD,
        CurrencyCode.EUR,
        CurrencyCode.ILS,
        CurrencyCode.GBP,
        CurrencyCode.CAD,
        CurrencyCode.AUD,
        CurrencyCode.JPY,
        CurrencyCode.CNY,
      ]

      currencies.forEach(currency => {
        setCurrency(currency)
        expect(getCurrency()).toBe(currency)
      })
    })
  })

  describe('removeCurrency', () => {
    it('should remove currency from localStorage', () => {
      setCurrency(CurrencyCode.USD)
      expect(getCurrency()).toBe(CurrencyCode.USD)

      removeCurrency()
      expect(getCurrency()).toBeNull()
    })

    it('should not throw error when removing non-existent currency', () => {
      expect(() => {
        removeCurrency()
      }).not.toThrow()
    })
  })

  describe('getLanguage', () => {
    it('should return null when no language is stored', () => {
      expect(getLanguage()).toBeNull()
    })

    it('should return stored language code', () => {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'it')
      expect(getLanguage()).toBe('it')
    })

    it('should return language code for all supported languages', () => {
      const languages = ['en', 'it', 'he']

      languages.forEach(lang => {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang)
        expect(getLanguage()).toBe(lang)
      })
    })
  })

  describe('setLanguage', () => {
    it('should save language code to localStorage', () => {
      setLanguage('en')
      expect(localStorage.getItem(STORAGE_KEYS.LANGUAGE)).toBe('en')
    })

    it('should overwrite existing language', () => {
      setLanguage('en')
      setLanguage('it')
      expect(getLanguage()).toBe('it')
    })

    it('should save all supported language codes', () => {
      const languages = ['en', 'it', 'he']

      languages.forEach(lang => {
        setLanguage(lang)
        expect(getLanguage()).toBe(lang)
      })
    })
  })

  describe('removeLanguage', () => {
    it('should remove language from localStorage', () => {
      setLanguage('en')
      expect(getLanguage()).toBe('en')

      removeLanguage()
      expect(getLanguage()).toBeNull()
    })

    it('should not throw error when removing non-existent language', () => {
      expect(() => {
        removeLanguage()
      }).not.toThrow()
    })
  })

  describe('integration', () => {
    it('should independently manage currency and language', () => {
      setCurrency(CurrencyCode.EUR)
      setLanguage('it')

      expect(getCurrency()).toBe(CurrencyCode.EUR)
      expect(getLanguage()).toBe('it')

      removeCurrency()
      expect(getCurrency()).toBeNull()
      expect(getLanguage()).toBe('it')

      removeLanguage()
      expect(getLanguage()).toBeNull()
    })

    it('should persist across multiple operations', () => {
      // Set initial values
      setCurrency(CurrencyCode.USD)
      setLanguage('en')

      // Change currency multiple times
      setCurrency(CurrencyCode.EUR)
      setCurrency(CurrencyCode.GBP)

      // Language should remain unchanged
      expect(getLanguage()).toBe('en')
      expect(getCurrency()).toBe(CurrencyCode.GBP)
    })
  })
})
