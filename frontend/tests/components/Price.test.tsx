// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Price component
 */

import { render, screen, waitFor } from '@testing-library/react'
import { Price } from '@/components/Price'
import * as client from '@/lib/client'
import { useCurrency } from '@/lib/currency/useCurrency'
import { convertCurrency } from '@/lib/currency/exchange-rates'
import { CurrencyCode, SymbolPositionEnum } from '@/lib/generated/types.gen'

// Mock dependencies
jest.mock('@/lib/client', () => ({
  getCurrencies: jest.fn(),
}))

jest.mock('@/lib/currency/useCurrency', () => ({
  useCurrency: jest.fn(),
}))

jest.mock('@/lib/currency/exchange-rates', () => ({
  convertCurrency: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en'),
}))

const mockGetCurrencies = client.getCurrencies as jest.MockedFunction<typeof client.getCurrencies>
const mockUseCurrency = useCurrency as jest.MockedFunction<typeof useCurrency>
const mockConvertCurrency = convertCurrency as jest.MockedFunction<typeof convertCurrency>

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

  const mockSetCurrency = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockGetCurrencies.mockResolvedValue(mockCurrencies)
    mockUseCurrency.mockReturnValue({
      currency: CurrencyCode.USD,
      setCurrency: mockSetCurrency,
    })
    mockConvertCurrency.mockImplementation((amount, from, to) => {
      // Simple mock: if same currency, return amount, otherwise apply 0.92 rate for EUR
      if (from === to) return amount
      if (to === CurrencyCode.EUR) return amount * 0.92
      return amount
    })
  })

  describe('loading state', () => {
    it('should show loading skeleton while fetching currencies', () => {
      mockGetCurrencies.mockReturnValue(
        new Promise<never>(() => {
          // Never resolves - testing loading state
        })
      )

      const { container } = render(<Price amount={99.99} />)

      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should not show price during loading', () => {
      mockGetCurrencies.mockReturnValue(
        new Promise<never>(() => {
          // Never resolves
        })
      )

      render(<Price amount={99.99} />)

      expect(screen.queryByTestId('price')).not.toBeInTheDocument()
    })
  })

  describe('basic rendering', () => {
    it('should render price with USD currency', async () => {
      render(<Price amount={99.99} />)

      await waitFor(() => {
        expect(screen.getByTestId('price')).toBeInTheDocument()
      })

      expect(screen.getByText(/\$99.99/)).toBeInTheDocument()
    })

    it('should render price with EUR currency when selected', async () => {
      mockUseCurrency.mockReturnValue({
        currency: CurrencyCode.EUR,
        setCurrency: mockSetCurrency,
      })

      render(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        expect(screen.getByTestId('price')).toBeInTheDocument()
      })

      // Converted amount should be shown
      expect(mockConvertCurrency).toHaveBeenCalledWith(100, CurrencyCode.USD, CurrencyCode.EUR)
    })

    it('should have data-testid attribute for E2E testing', async () => {
      render(<Price amount={99.99} />)

      await waitFor(() => {
        const priceElement = screen.getByTestId('price')
        expect(priceElement).toBeInTheDocument()
      })
    })
  })

  describe('currency conversion', () => {
    it('should convert price to selected currency', async () => {
      mockUseCurrency.mockReturnValue({
        currency: CurrencyCode.EUR,
        setCurrency: mockSetCurrency,
      })

      render(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        expect(mockConvertCurrency).toHaveBeenCalledWith(100, CurrencyCode.USD, CurrencyCode.EUR)
      })
    })

    it('should not convert if source and target currency are the same', async () => {
      mockUseCurrency.mockReturnValue({
        currency: CurrencyCode.USD,
        setCurrency: mockSetCurrency,
      })

      render(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        expect(screen.getByTestId('price')).toBeInTheDocument()
      })

      expect(mockConvertCurrency).toHaveBeenCalledWith(100, CurrencyCode.USD, CurrencyCode.USD)
    })
  })

  describe('formatting', () => {
    it('should format price with currency symbol before amount (USD)', async () => {
      render(<Price amount={99.99} />)

      await waitFor(() => {
        const price = screen.getByTestId('price')
        expect(price.textContent).toMatch(/\$99\.99/)
      })
    })

    it('should format price with currency symbol after amount (EUR)', async () => {
      mockUseCurrency.mockReturnValue({
        currency: CurrencyCode.EUR,
        setCurrency: mockSetCurrency,
      })
      mockConvertCurrency.mockReturnValue(92)

      render(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        const price = screen.getByTestId('price')
        // EUR uses AFTER position
        expect(price.textContent).toMatch(/92,00.*€/)
      })
    })

    it('should apply custom decimal separator', async () => {
      mockUseCurrency.mockReturnValue({
        currency: CurrencyCode.EUR,
        setCurrency: mockSetCurrency,
      })
      mockConvertCurrency.mockReturnValue(92.5)

      render(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        const price = screen.getByTestId('price')
        // EUR uses comma as decimal separator
        expect(price.textContent).toContain('92,50')
      })
    })
  })

  describe('currency code display', () => {
    it('should show currency code by default', async () => {
      render(<Price amount={99.99} />)

      await waitFor(() => {
        expect(screen.getByText(CurrencyCode.USD)).toBeInTheDocument()
      })
    })

    it('should hide currency code when showCurrencyCode is false', async () => {
      render(<Price amount={99.99} showCurrencyCode={false} />)

      await waitFor(() => {
        expect(screen.getByTestId('price')).toBeInTheDocument()
        expect(screen.queryByText(CurrencyCode.USD)).not.toBeInTheDocument()
      })
    })
  })

  describe('className prop', () => {
    it('should apply custom className', async () => {
      render(<Price amount={99.99} className="custom-class" />)

      await waitFor(() => {
        const price = screen.getByTestId('price')
        expect(price).toHaveClass('custom-class')
        expect(price).toHaveClass('font-medium') // Default class
      })
    })
  })

  describe('error handling', () => {
    it('should handle getCurrencies error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockGetCurrencies.mockRejectedValue(new Error('API error'))

      render(<Price amount={99.99} />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should show plain amount if currency not found', async () => {
      // Return empty array - currencies not found
      mockGetCurrencies.mockResolvedValue([])

      render(<Price amount={99.99} />)

      await waitFor(() => {
        expect(screen.getByText('99.99')).toBeInTheDocument()
      })
    })

    it('should show plain amount if source currency not found', async () => {
      render(<Price amount={99.99} currencyCode={'INVALID' as CurrencyCode} />)

      await waitFor(() => {
        expect(screen.getByText('99.99')).toBeInTheDocument()
      })
    })

    it('should show plain amount if target currency not found', async () => {
      mockUseCurrency.mockReturnValue({
        currency: 'INVALID' as CurrencyCode,
        setCurrency: mockSetCurrency,
      })

      render(<Price amount={99.99} />)

      await waitFor(() => {
        expect(screen.getByText('99.99')).toBeInTheDocument()
      })
    })
  })

  describe('decimal places', () => {
    it('should respect currency decimal places', async () => {
      render(<Price amount={99} />)

      await waitFor(() => {
        const price = screen.getByTestId('price')
        // USD has 2 decimal places
        expect(price.textContent).toMatch(/99\.00/)
      })
    })
  })

  describe('component reusability', () => {
    it('should support multiple Price components on same page', async () => {
      render(
        <div>
          <Price amount={10} data-testid="price-1" />
          <Price amount={20} data-testid="price-2" />
        </div>
      )

      await waitFor(() => {
        expect(screen.getAllByTestId('price')).toHaveLength(2)
      })
    })

    it('should update when useCurrency changes', async () => {
      const { rerender } = render(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        expect(screen.getByTestId('price')).toBeInTheDocument()
      })

      // Change currency
      mockUseCurrency.mockReturnValue({
        currency: CurrencyCode.EUR,
        setCurrency: mockSetCurrency,
      })

      rerender(<Price amount={100} currencyCode={CurrencyCode.USD} />)

      await waitFor(() => {
        expect(mockConvertCurrency).toHaveBeenCalledWith(100, CurrencyCode.USD, CurrencyCode.EUR)
      })
    })
  })
})
