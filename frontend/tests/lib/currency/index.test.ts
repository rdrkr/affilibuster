// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for currency module barrel exports
 *
 * These tests verify that the currency module properly exports
 * all its public APIs through the index file.
 */

import * as CurrencyModule from '@/lib/currency'

describe('Currency Module Exports', () => {
  describe('API Functions', () => {
    it('should export getCurrencies function', () => {
      expect(CurrencyModule.getCurrencies).toBeDefined()
      expect(typeof CurrencyModule.getCurrencies).toBe('function')
    })
  })

  describe('Exchange Rates', () => {
    it('should export convertCurrency function', () => {
      expect(CurrencyModule.convertCurrency).toBeDefined()
      expect(typeof CurrencyModule.convertCurrency).toBe('function')
    })

    it('should export getExchangeRate function', () => {
      expect(CurrencyModule.getExchangeRate).toBeDefined()
      expect(typeof CurrencyModule.getExchangeRate).toBe('function')
    })

    it('should export EXCHANGE_RATES constant', () => {
      expect(CurrencyModule.EXCHANGE_RATES).toBeDefined()
      expect(typeof CurrencyModule.EXCHANGE_RATES).toBe('object')
    })
  })

  describe('Hooks', () => {
    it('should export useCurrency hook', () => {
      expect(CurrencyModule.useCurrency).toBeDefined()
      expect(typeof CurrencyModule.useCurrency).toBe('function')
    })
  })
})
