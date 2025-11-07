// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Price component
 */
import { CodeEnum, CurrencyCode, SymbolPositionEnum } from '@/lib/generated/types.gen'

import { render, screen, waitFor } from '@testing-library/react'
import { Price } from '@/components/Price'
import * as client from '@/lib/client'
import { useSession } from '@/hooks/useSession'

// Mock dependencies
jest.mock('@/hooks/useSession')
jest.mock('@/lib/client', () => ({
  getCurrencies: jest.fn(),
  getUserPreferences: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockGetCurrencies = client.getCurrencies as jest.MockedFunction<typeof client.getCurrencies>
const mockGetUserPreferences = client.getUserPreferences as jest.MockedFunction<typeof client.getUserPreferences>

describe('Price', () => {
  const mockCurrencies = [
    {
      documentId: 'usd-doc-id',
      id: 1,
      code: CurrencyCode.USD,
      name: 'US Dollar',
      symbol: '$',
      displayName: 'US Dollar',
      decimalPlaces: 2,
      symbolPosition: SymbolPositionEnum.BEFORE as const,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      exchangeRate: 1.0,
      sortOrder: 1,
      isActive: true,
      publishedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      documentId: 'eur-doc-id',
      id: 2,
      code: CurrencyCode.EUR,
      name: 'Euro',
      symbol: '€',
      displayName: 'Euro',
      decimalPlaces: 2,
      symbolPosition: SymbolPositionEnum.AFTER as const,
      thousandsSeparator: '.',
      decimalSeparator: ',',
      exchangeRate: 0.92,
      sortOrder: 2,
      isActive: true,
      publishedAt: '2025-01-01T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue('test-session-123')
  })

  describe('loading state', () => {
    it('should show loading skeleton while fetching data', () => {
      // Mock promises that never resolve to test loading state
      mockGetCurrencies.mockReturnValue(
        new Promise<never>(() => {
          // Intentionally empty - testing loading state
        })
      )

      mockGetUserPreferences.mockReturnValue(
        new Promise<never>(() => {
          // Intentionally empty - testing loading state
        })
      )

      const { container } = render(<Price amount={99.99} />)

      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should not render actual price while loading', () => {
      mockGetCurrencies.mockReturnValue(
        new Promise<never>(() => {
          // Intentionally empty - testing loading state
        })
      )

      mockGetUserPreferences.mockReturnValue(
        new Promise<never>(() => {
          // Intentionally empty - testing loading state
        })
      )

      render(<Price amount={99.99} />)

      expect(screen.queryByText(/99/)).not.toBeInTheDocument()
    })
  })

  describe('USD formatting', () => {
    it('should format USD with default settings', async () => {
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.USD,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
      })

      render(<Price amount={1234.56} />)

      await waitFor(() => {
        expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument()
      })
    })

    it('should show currency code when showCurrencyCode is true', async () => {
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.USD,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
      })

      render(<Price amount={99.99} showCurrencyCode={true} />)

      await waitFor(() => {
        expect(screen.getByText(CurrencyCode.USD)).toBeInTheDocument()
      })
    })

    it('should hide currency code when showCurrencyCode is false', async () => {
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.USD,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
      })

      render(<Price amount={99.99} showCurrencyCode={false} />)

      await waitFor(() => {
        expect(screen.queryByText(CurrencyCode.USD)).not.toBeInTheDocument()
      })
    })
  })

  describe('EUR formatting', () => {
    it('should format EUR with symbol after amount', async () => {
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.EUR,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.IT,
      })

      render(<Price amount={1234.56} currencyCode="EUR" />)

      await waitFor(() => {
        expect(screen.getByText(/1\.234,56 €/)).toBeInTheDocument()
      })
    })
  })

  describe('user preferences', () => {
    it('should use user preferred currency over prop', async () => {
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.EUR,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
      })

      render(<Price amount={100} currencyCode="USD" />)

      await waitFor(() => {
        expect(screen.getByText(/€/)).toBeInTheDocument()
      })
    })

    it('should fallback to prop currency when preferences fail', async () => {
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockRejectedValue(new Error('Network error'))

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

      expect(mockGetCurrencies).not.toHaveBeenCalled()
      expect(mockGetUserPreferences).not.toHaveBeenCalled()
    })

    it('should fetch data when session ID becomes available', async () => {
      mockUseSession.mockReturnValue('test-session-456')
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session-456',
        selectedCurrency: CurrencyCode.USD,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
      })

      render(<Price amount={100} />)

      await waitFor(() => {
        expect(mockGetCurrencies).toHaveBeenCalled()
        expect(mockGetUserPreferences).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('should show plain amount when currency not found', async () => {
      mockGetCurrencies.mockResolvedValue([])
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.USD,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
      })

      render(<Price amount={123.45} />)

      await waitFor(() => {
        expect(screen.getByText('123.45')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      mockGetCurrencies.mockRejectedValue(new Error('API error'))
      mockGetUserPreferences.mockRejectedValue(new Error('API error'))
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
      mockGetCurrencies.mockResolvedValue(mockCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.USD,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN,
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
          documentId: 'jpy-doc-id',
          id: 1,
          code: CurrencyCode.JPY,
          name: 'Japanese Yen',
          symbol: '¥',
          displayName: 'Japanese Yen',
          decimalPlaces: 0,
          symbolPosition: SymbolPositionEnum.BEFORE as const,
          thousandsSeparator: ',',
          decimalSeparator: '.',
          exchangeRate: 149.5,
          sortOrder: 1,
          isActive: true,
          publishedAt: '2025-01-01T00:00:00.000Z',
        },
      ]

      mockGetCurrencies.mockResolvedValue(jpyCurrencies)
      mockGetUserPreferences.mockResolvedValue({
        id: '1',
        sessionId: 'test-session',
        selectedCurrency: CurrencyCode.JPY,
        dismissedLanguagePrompt: false,
        detectedLanguage: CodeEnum.EN, // Change to valid language code
      })

      render(<Price amount={5000} currencyCode="JPY" />)

      await waitFor(() => {
        expect(screen.getByText(/¥5,000/)).toBeInTheDocument()
        expect(screen.queryByText(/\./)).not.toBeInTheDocument()
      })
    })
  })
})
