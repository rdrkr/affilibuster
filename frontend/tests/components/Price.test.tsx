// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Price component
 */

import { render, screen, waitFor } from '@testing-library/react'
import { Price } from '@/components/Price'
import { currenciesAPI, preferencesAPI } from '@/lib/api'
import { useSession } from '@/hooks/useSession'

// Mock dependencies
jest.mock('@/hooks/useSession')
jest.mock('@/lib/api', () => ({
  currenciesAPI: {
    getAll: jest.fn(),
  },
  preferencesAPI: {
    get: jest.fn(),
  },
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockGetAllCurrencies = currenciesAPI.getAll as jest.MockedFunction<typeof currenciesAPI.getAll>
const mockGetPreferences = preferencesAPI.get as jest.MockedFunction<typeof preferencesAPI.get>

describe('Price', () => {
  const mockCurrencies = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
      symbolPosition: 'before',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      sortOrder: 1,
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      decimalPlaces: 2,
      symbolPosition: 'after',
      thousandsSeparator: '.',
      decimalSeparator: ',',
      isActive: true,
      sortOrder: 2,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue('test-session-123')
  })

  describe('loading state', () => {
    it('should show loading skeleton while fetching data', () => {
      mockGetAllCurrencies.mockReturnValue(
        new Promise(() => {}) // Never resolves
      )
      mockGetPreferences.mockReturnValue(new Promise(() => {}))

      const { container } = render(<Price amount={99.99} />)

      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should not render actual price while loading', () => {
      mockGetAllCurrencies.mockReturnValue(new Promise(() => {}))
      mockGetPreferences.mockReturnValue(new Promise(() => {}))

      render(<Price amount={99.99} />)

      expect(screen.queryByText(/99/)).not.toBeInTheDocument()
    })
  })

  describe('USD formatting', () => {
    it('should format USD with default settings', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'USD',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      render(<Price amount={1234.56} />)

      await waitFor(() => {
        expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument()
      })
    })

    it('should show currency code when showCurrencyCode is true', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'USD',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      render(<Price amount={99.99} showCurrencyCode={true} />)

      await waitFor(() => {
        expect(screen.getByText('USD')).toBeInTheDocument()
      })
    })

    it('should hide currency code when showCurrencyCode is false', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'USD',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      render(<Price amount={99.99} showCurrencyCode={false} />)

      await waitFor(() => {
        expect(screen.queryByText('USD')).not.toBeInTheDocument()
      })
    })
  })

  describe('EUR formatting', () => {
    it('should format EUR with symbol after amount', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'EUR',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'it',
      })

      render(<Price amount={1234.56} currencyCode="EUR" />)

      await waitFor(() => {
        expect(screen.getByText(/1\.234,56 €/)).toBeInTheDocument()
      })
    })
  })

  describe('user preferences', () => {
    it('should use user preferred currency over prop', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'EUR',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      render(<Price amount={100} currencyCode="USD" />)

      await waitFor(() => {
        expect(screen.getByText(/€/)).toBeInTheDocument()
      })
    })

    it('should fallback to prop currency when preferences fail', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockRejectedValue(new Error('Network error'))

      render(<Price amount={100} currencyCode="USD" />)

      await waitFor(() => {
        expect(screen.getByText(/\$/)).toBeInTheDocument()
      })
    })
  })

  describe('session handling', () => {
    it('should wait for session ID before fetching', () => {
      mockUseSession.mockReturnValue(null)

      render(<Price amount={100} />)

      expect(mockGetAllCurrencies).not.toHaveBeenCalled()
      expect(mockGetPreferences).not.toHaveBeenCalled()
    })

    it('should fetch data when session ID becomes available', async () => {
      mockUseSession.mockReturnValue('test-session-456')
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session-456',
        selectedCurrency: 'USD',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      render(<Price amount={100} />)

      await waitFor(() => {
        expect(mockGetAllCurrencies).toHaveBeenCalled()
        expect(mockGetPreferences).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('should show plain amount when currency not found', async () => {
      mockGetAllCurrencies.mockResolvedValue([])
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'XXX',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      render(<Price amount={123.45} />)

      await waitFor(() => {
        expect(screen.getByText('123.45')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      mockGetAllCurrencies.mockRejectedValue(new Error('API error'))
      mockGetPreferences.mockRejectedValue(new Error('API error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<Price amount={100} />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('custom className', () => {
    it('should apply custom className', async () => {
      mockGetAllCurrencies.mockResolvedValue(mockCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'USD',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'en',
      })

      const { container } = render(<Price amount={100} className="custom-class" />)

      await waitFor(() => {
        const span = container.querySelector('.custom-class')
        expect(span).toBeInTheDocument()
      })
    })
  })

  describe('decimal places', () => {
    it('should respect currency decimal places', async () => {
      const jpyCurrencies = [
        {
          code: 'JPY',
          name: 'Japanese Yen',
          symbol: '¥',
          decimalPlaces: 0,
          symbolPosition: 'before',
          thousandsSeparator: ',',
          decimalSeparator: '.',
          isActive: true,
          sortOrder: 1,
        },
      ]

      mockGetAllCurrencies.mockResolvedValue(jpyCurrencies)
      mockGetPreferences.mockResolvedValue({
        sessionId: 'test-session',
        selectedCurrency: 'JPY',
        dismissedLanguagePrompt: false,
        detectedLanguage: 'ja',
      })

      render(<Price amount={5000} currencyCode="JPY" />)

      await waitFor(() => {
        expect(screen.getByText(/¥5,000/)).toBeInTheDocument()
        expect(screen.queryByText(/\./)).not.toBeInTheDocument()
      })
    })
  })
})
