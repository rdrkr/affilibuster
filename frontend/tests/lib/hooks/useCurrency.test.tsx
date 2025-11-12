// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for useCurrency hook
 */

import { renderHook, act } from '@testing-library/react'
import { useCurrency, getDefaultCurrencyForLanguage } from '@/lib/currency/useCurrency'
import { CurrencyCode } from '@/lib/types'
import { getCurrency, setCurrency } from '@/lib/core/storage'

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}))

// Mock storage
jest.mock('@/lib/core/storage', () => ({
  getCurrency: jest.fn(),
  setCurrency: jest.fn(),
  removeCurrency: jest.fn(),
}))

const mockUseLocale = jest.requireMock('next-intl').useLocale as jest.Mock
const mockGetCurrency = getCurrency as jest.MockedFunction<typeof getCurrency>
const mockSetCurrency = setCurrency as jest.MockedFunction<typeof setCurrency>

describe('useCurrency hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseLocale.mockReturnValue('en')
    mockGetCurrency.mockReturnValue(null)
  })

  describe('getDefaultCurrencyForLanguage', () => {
    it('should return USD for English', () => {
      expect(getDefaultCurrencyForLanguage('en')).toBe(CurrencyCode.USD)
    })

    it('should return EUR for Italian', () => {
      expect(getDefaultCurrencyForLanguage('it')).toBe(CurrencyCode.EUR)
    })

    it('should return ILS for Hebrew', () => {
      expect(getDefaultCurrencyForLanguage('he')).toBe(CurrencyCode.ILS)
    })

    it('should return USD for unknown languages', () => {
      expect(getDefaultCurrencyForLanguage('fr')).toBe(CurrencyCode.USD)
      expect(getDefaultCurrencyForLanguage('de')).toBe(CurrencyCode.USD)
      expect(getDefaultCurrencyForLanguage('es')).toBe(CurrencyCode.USD)
    })
  })

  describe('useCurrency', () => {
    describe('initial currency selection', () => {
      it('should use stored currency if available', () => {
        mockGetCurrency.mockReturnValue(CurrencyCode.GBP)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())

        expect(result.current.currency).toBe(CurrencyCode.GBP)
      })

      it('should use language default for English when no stored currency', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())

        expect(result.current.currency).toBe(CurrencyCode.USD)
      })

      it('should use language default for Italian when no stored currency', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('it')

        const { result } = renderHook(() => useCurrency())

        expect(result.current.currency).toBe(CurrencyCode.EUR)
      })

      it('should use language default for Hebrew when no stored currency', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('he')

        const { result } = renderHook(() => useCurrency())

        expect(result.current.currency).toBe(CurrencyCode.ILS)
      })

      it('should prioritize stored currency over language default', () => {
        mockGetCurrency.mockReturnValue(CurrencyCode.JPY)
        mockUseLocale.mockReturnValue('it') // Italian would default to EUR

        const { result } = renderHook(() => useCurrency())

        expect(result.current.currency).toBe(CurrencyCode.JPY)
      })
    })

    describe('locale changes', () => {
      it('should update to new language default when locale changes and no stored preference', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result, rerender } = renderHook(() => useCurrency())
        expect(result.current.currency).toBe(CurrencyCode.USD)

        // Change locale to Italian
        mockUseLocale.mockReturnValue('it')
        rerender()

        expect(result.current.currency).toBe(CurrencyCode.EUR)
      })

      it('should NOT update currency when locale changes if user has stored preference', () => {
        mockGetCurrency.mockReturnValue(CurrencyCode.GBP)
        mockUseLocale.mockReturnValue('en')

        const { result, rerender } = renderHook(() => useCurrency())
        expect(result.current.currency).toBe(CurrencyCode.GBP)

        // Change locale to Italian
        mockUseLocale.mockReturnValue('it')
        rerender()

        // Should still be GBP because user has explicit preference
        expect(result.current.currency).toBe(CurrencyCode.GBP)
      })
    })

    describe('setCurrency', () => {
      it('should update currency state', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())
        expect(result.current.currency).toBe(CurrencyCode.USD)

        act(() => {
          result.current.setCurrency(CurrencyCode.EUR)
        })

        expect(result.current.currency).toBe(CurrencyCode.EUR)
      })

      it('should persist currency to localStorage', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())

        act(() => {
          result.current.setCurrency(CurrencyCode.EUR)
        })

        expect(mockSetCurrency).toHaveBeenCalledWith(CurrencyCode.EUR)
        expect(mockSetCurrency).toHaveBeenCalledTimes(1)
      })

      it('should allow changing currency multiple times', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())

        act(() => {
          result.current.setCurrency(CurrencyCode.EUR)
        })
        expect(result.current.currency).toBe(CurrencyCode.EUR)

        act(() => {
          result.current.setCurrency(CurrencyCode.GBP)
        })
        expect(result.current.currency).toBe(CurrencyCode.GBP)

        act(() => {
          result.current.setCurrency(CurrencyCode.JPY)
        })
        expect(result.current.currency).toBe(CurrencyCode.JPY)

        expect(mockSetCurrency).toHaveBeenCalledTimes(3)
      })

      it('should work with all supported currencies', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())

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

        currencies.forEach((currency, index) => {
          act(() => {
            result.current.setCurrency(currency)
          })
          expect(result.current.currency).toBe(currency)
          expect(mockSetCurrency).toHaveBeenNthCalledWith(index + 1, currency)
        })
      })
    })

    describe('return value', () => {
      it('should return object with currency and setCurrency', () => {
        mockGetCurrency.mockReturnValue(null)
        mockUseLocale.mockReturnValue('en')

        const { result } = renderHook(() => useCurrency())

        expect(result.current).toHaveProperty('currency')
        expect(result.current).toHaveProperty('setCurrency')
        expect(typeof result.current.currency).toBe('string')
        expect(typeof result.current.setCurrency).toBe('function')
      })
    })
  })
})
