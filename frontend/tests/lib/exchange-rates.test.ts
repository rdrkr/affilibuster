// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for exchange rates utilities
 */

import { convertCurrency, getExchangeRate, EXCHANGE_RATES } from '@/lib/currency/exchange-rates'
import { CurrencyCode } from '@/lib/types'

describe('exchange rates utilities', () => {
  describe('EXCHANGE_RATES', () => {
    it('should have exchange rates for all supported currencies', () => {
      expect(EXCHANGE_RATES[CurrencyCode.USD]).toBe(1.0)
      expect(EXCHANGE_RATES[CurrencyCode.EUR]).toBeGreaterThan(0)
      expect(EXCHANGE_RATES[CurrencyCode.ILS]).toBeGreaterThan(0)
      expect(EXCHANGE_RATES[CurrencyCode.GBP]).toBeGreaterThan(0)
      expect(EXCHANGE_RATES[CurrencyCode.CAD]).toBeGreaterThan(0)
      expect(EXCHANGE_RATES[CurrencyCode.AUD]).toBeGreaterThan(0)
      expect(EXCHANGE_RATES[CurrencyCode.JPY]).toBeGreaterThan(0)
      expect(EXCHANGE_RATES[CurrencyCode.CNY]).toBeGreaterThan(0)
    })

    it('should use USD as base currency with rate 1.0', () => {
      expect(EXCHANGE_RATES[CurrencyCode.USD]).toBe(1.0)
    })

    it('should have all currencies defined in CurrencyCode enum', () => {
      const currencyCodes = Object.values(CurrencyCode)
      currencyCodes.forEach(code => {
        expect(EXCHANGE_RATES[code]).toBeDefined()
        expect(typeof EXCHANGE_RATES[code]).toBe('number')
      })
    })
  })

  describe('convertCurrency', () => {
    it('should return same amount when converting to same currency', () => {
      expect(convertCurrency(100, CurrencyCode.USD, CurrencyCode.USD)).toBe(100)
      expect(convertCurrency(50, CurrencyCode.EUR, CurrencyCode.EUR)).toBe(50)
      expect(convertCurrency(1000, CurrencyCode.JPY, CurrencyCode.JPY)).toBe(1000)
    })

    it('should convert USD to EUR correctly', () => {
      const result = convertCurrency(100, CurrencyCode.USD, CurrencyCode.EUR)
      // 100 USD * 0.92 = 92 EUR
      expect(result).toBe(92)
    })

    it('should convert EUR to USD correctly', () => {
      const result = convertCurrency(92, CurrencyCode.EUR, CurrencyCode.USD)
      // 92 EUR / 0.92 = 100 USD
      expect(result).toBe(100)
    })

    it('should convert USD to ILS correctly', () => {
      const result = convertCurrency(100, CurrencyCode.USD, CurrencyCode.ILS)
      // 100 USD * 3.65 = 365 ILS
      expect(result).toBe(365)
    })

    it('should convert ILS to USD correctly', () => {
      const result = convertCurrency(365, CurrencyCode.ILS, CurrencyCode.USD)
      // 365 ILS / 3.65 = 100 USD
      expect(result).toBe(100)
    })

    it('should convert GBP to EUR correctly', () => {
      const result = convertCurrency(100, CurrencyCode.GBP, CurrencyCode.EUR)
      // 100 GBP -> USD: 100 / 0.79 = 126.58...
      // 126.58 USD -> EUR: 126.58 * 0.92 = 116.45...
      const expected = (100 / EXCHANGE_RATES[CurrencyCode.GBP]) * EXCHANGE_RATES[CurrencyCode.EUR]
      expect(result).toBeCloseTo(expected, 2)
    })

    it('should handle fractional amounts', () => {
      const result = convertCurrency(49.99, CurrencyCode.USD, CurrencyCode.EUR)
      const expected = 49.99 * EXCHANGE_RATES[CurrencyCode.EUR]
      expect(result).toBeCloseTo(expected, 2)
    })

    it('should handle zero amount', () => {
      expect(convertCurrency(0, CurrencyCode.USD, CurrencyCode.EUR)).toBe(0)
      expect(convertCurrency(0, CurrencyCode.EUR, CurrencyCode.USD)).toBe(0)
    })

    it('should handle negative amounts', () => {
      const result = convertCurrency(-100, CurrencyCode.USD, CurrencyCode.EUR)
      expect(result).toBe(-92)
    })

    it('should convert between all currency pairs correctly', () => {
      const currencies = Object.values(CurrencyCode)
      const amount = 100

      currencies.forEach(from => {
        currencies.forEach(to => {
          const result = convertCurrency(amount, from, to)

          if (from === to) {
            expect(result).toBe(amount)
          } else {
            expect(result).toBeGreaterThan(0)
            expect(typeof result).toBe('number')
            expect(isFinite(result)).toBe(true)
          }
        })
      })
    })

    it('should be reversible (convert back should give original amount)', () => {
      const original = 100
      const converted = convertCurrency(original, CurrencyCode.USD, CurrencyCode.EUR)
      const backConverted = convertCurrency(converted, CurrencyCode.EUR, CurrencyCode.USD)

      expect(backConverted).toBeCloseTo(original, 10)
    })

    it('should warn and return original amount for unknown currency', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      const result = convertCurrency(100, 'INVALID' as CurrencyCode, CurrencyCode.USD)
      expect(result).toBe(100)
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })

    it('should convert large amounts accurately', () => {
      const large = 1000000
      const result = convertCurrency(large, CurrencyCode.USD, CurrencyCode.JPY)
      const expected = large * EXCHANGE_RATES[CurrencyCode.JPY]
      expect(result).toBe(expected)
    })

    it('should convert small amounts accurately', () => {
      const small = 0.01
      const result = convertCurrency(small, CurrencyCode.USD, CurrencyCode.EUR)
      const expected = small * EXCHANGE_RATES[CurrencyCode.EUR]
      expect(result).toBeCloseTo(expected, 4)
    })
  })

  describe('getExchangeRate', () => {
    it('should return 1.0 for same currency', () => {
      expect(getExchangeRate(CurrencyCode.USD, CurrencyCode.USD)).toBe(1.0)
      expect(getExchangeRate(CurrencyCode.EUR, CurrencyCode.EUR)).toBe(1.0)
    })

    it('should return correct rate for USD to EUR', () => {
      const rate = getExchangeRate(CurrencyCode.USD, CurrencyCode.EUR)
      expect(rate).toBe(EXCHANGE_RATES[CurrencyCode.EUR])
    })

    it('should return correct rate for EUR to USD', () => {
      const rate = getExchangeRate(CurrencyCode.EUR, CurrencyCode.USD)
      const expected = 1 / EXCHANGE_RATES[CurrencyCode.EUR]
      expect(rate).toBeCloseTo(expected, 10)
    })

    it('should return correct rate for USD to ILS', () => {
      const rate = getExchangeRate(CurrencyCode.USD, CurrencyCode.ILS)
      expect(rate).toBe(EXCHANGE_RATES[CurrencyCode.ILS])
    })

    it('should return correct rate for GBP to EUR', () => {
      const rate = getExchangeRate(CurrencyCode.GBP, CurrencyCode.EUR)
      const expected = (1 / EXCHANGE_RATES[CurrencyCode.GBP]) * EXCHANGE_RATES[CurrencyCode.EUR]
      expect(rate).toBeCloseTo(expected, 10)
    })

    it('should be consistent with convertCurrency', () => {
      const currencies = Object.values(CurrencyCode)
      const amount = 100

      currencies.forEach(from => {
        currencies.forEach(to => {
          const rate = getExchangeRate(from, to)
          const converted = convertCurrency(amount, from, to)
          expect(converted).toBeCloseTo(amount * rate, 10)
        })
      })
    })

    it('should calculate inverse rates correctly', () => {
      const currencies = Object.values(CurrencyCode)

      currencies.forEach(from => {
        currencies.forEach(to => {
          if (from !== to) {
            const rate = getExchangeRate(from, to)
            const inverseRate = getExchangeRate(to, from)
            expect(rate * inverseRate).toBeCloseTo(1.0, 10)
          }
        })
      })
    })

    it('should handle all currency pairs', () => {
      const currencies = Object.values(CurrencyCode)

      currencies.forEach(from => {
        currencies.forEach(to => {
          const rate = getExchangeRate(from, to)
          expect(rate).toBeGreaterThan(0)
          expect(typeof rate).toBe('number')
          expect(isFinite(rate)).toBe(true)
        })
      })
    })
  })
})
