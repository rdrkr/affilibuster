// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Component Test for CurrencySelector (T049)
 *
 * Tests the currency selector dropdown component.
 * Reference: plan.md:143-147 (Modular components: Currency selector)
 * Reference: T110 (CurrencySelector component implementation)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CurrencySelector } from '@/components/CurrencySelector'
import { currenciesAPI, preferencesAPI } from '@/lib/api'
import { useSession } from '@/hooks/useSession'

// Mock dependencies
jest.mock('@/lib/api', () => ({
  currenciesAPI: {
    getAll: jest.fn(),
  },
  preferencesAPI: {
    get: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock('@/hooks/useSession', () => ({
  useSession: jest.fn(),
}))

describe('CurrencySelector Component', () => {
  const mockSessionId = 'test-session-123'

  const mockCurrencies = [
    {
      code: 'USD',
      displayName: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
      symbolPosition: 'before' as const,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      sortOrder: 1,
    },
    {
      code: 'EUR',
      displayName: 'Euro',
      symbol: '€',
      decimalPlaces: 2,
      symbolPosition: 'after' as const,
      thousandsSeparator: '.',
      decimalSeparator: ',',
      isActive: true,
      sortOrder: 2,
    },
    {
      code: 'ILS',
      displayName: 'Israeli Shekel',
      symbol: '₪',
      decimalPlaces: 2,
      symbolPosition: 'before' as const,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      sortOrder: 3,
    },
  ]

  const mockPreferences = {
    id: '123',
    sessionId: mockSessionId,
    selectedCurrency: 'EUR',
    dismissedLanguagePrompt: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    expiresAt: '2025-02-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSessionId)
    ;(currenciesAPI.getAll as jest.Mock).mockResolvedValue(mockCurrencies)
    ;(preferencesAPI.get as jest.Mock).mockResolvedValue(mockPreferences)
    ;(preferencesAPI.update as jest.Mock).mockResolvedValue(mockPreferences)
  })

  it('should render currency selector button', async () => {
    render(<CurrencySelector />)

    // Wait for currencies to load and button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select currency/i })).toBeInTheDocument()
    })

    // Verify EUR is displayed (from mockPreferences)
    expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
  })

  it('should display user preferred currency from API', async () => {
    render(<CurrencySelector />)

    // Should load and display EUR (from mockPreferences)
    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })
  })

  it('should default to USD when no preferences exist', async () => {
    ;(preferencesAPI.get as jest.Mock).mockRejectedValue(new Error('Not found'))

    render(<CurrencySelector />)

    // Should default to USD
    await waitFor(() => {
      expect(screen.getByText(/\$ USD/)).toBeInTheDocument()
    })
  })

  it('should open dropdown when button is clicked', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Click button to open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Should show all 3 currencies
    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.getByText('Israeli Shekel')).toBeInTheDocument()
  })

  it('should call API to update currency when option is selected', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Click USD
    const usdOption = screen.getByText('US Dollar')
    fireEvent.click(usdOption)

    // Should call update API
    await waitFor(() => {
      expect(preferencesAPI.update).toHaveBeenCalledWith({
        selectedCurrency: 'USD',
      })
    })
  })

  it('should update displayed currency after selection', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Click ILS
    const ilsOption = screen.getByText('Israeli Shekel')
    fireEvent.click(ilsOption)

    // Should update to ILS
    await waitFor(() => {
      expect(screen.getByText(/₪ ILS/)).toBeInTheDocument()
    })
  })

  it('should close dropdown after currency is selected', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Dropdown should be visible
    expect(screen.getByText('US Dollar')).toBeInTheDocument()

    // Click USD
    const usdOption = screen.getByText('US Dollar')
    fireEvent.click(usdOption)

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('US Dollar')).not.toBeInTheDocument()
    })
  })

  it('should close dropdown when clicking backdrop', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Dropdown should be visible
    expect(screen.getByText('US Dollar')).toBeInTheDocument()

    // Click backdrop
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('US Dollar')).not.toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(preferencesAPI.update as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Click USD
    const usdOption = screen.getByText('US Dollar')
    fireEvent.click(usdOption)

    // Should log error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    // Component should not crash
    expect(screen.getByRole('button', { name: /select currency/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should show loading state initially', () => {
    render(<CurrencySelector />)

    // Should show loading skeleton
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()
  })

  it('should not load data without session ID', async () => {
    ;(useSession as jest.Mock).mockReturnValue(null)

    render(<CurrencySelector />)

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should not have called APIs
    expect(currenciesAPI.getAll).not.toHaveBeenCalled()
    expect(preferencesAPI.get).not.toHaveBeenCalled()
  })

  it('should display currency symbol and code', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      const buttonText = screen.getByRole('button', {
        name: /select currency/i,
      }).textContent
      // Should contain both symbol (€) and code (EUR)
      expect(buttonText).toContain('€')
      expect(buttonText).toContain('EUR')
    })
  })

  it('should show currency names in dropdown', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Should show full currency names
    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.getByText('Israeli Shekel')).toBeInTheDocument()
  })

  it('should highlight currently selected currency in dropdown', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Find EUR button (currently selected)
    const euroButton = screen.getByText('Euro').closest('button')

    // Should have highlighting class
    expect(euroButton).toHaveClass('font-medium')
  })

  it('should have proper accessibility attributes', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /select currency/i })

    // Should have aria-label
    expect(button).toHaveAttribute('aria-label', 'Select currency')

    // Should have aria-expanded
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Open dropdown
    fireEvent.click(button)

    // aria-expanded should be true
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should load multiple currencies correctly', async () => {
    const manyCurrencies = [
      ...mockCurrencies,
      {
        code: 'GBP',
        displayName: 'British Pound',
        symbol: '£',
        decimalPlaces: 2,
        symbolPosition: 'before' as const,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        isActive: true,
        sortOrder: 4,
      },
      {
        code: 'JPY',
        displayName: 'Japanese Yen',
        symbol: '¥',
        decimalPlaces: 0,
        symbolPosition: 'before' as const,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        isActive: true,
        sortOrder: 5,
      },
    ]

    ;(currenciesAPI.getAll as jest.Mock).mockResolvedValue(manyCurrencies)

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Should show all 5 currencies
    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.getByText('Israeli Shekel')).toBeInTheDocument()
    expect(screen.getByText('British Pound')).toBeInTheDocument()
    expect(screen.getByText('Japanese Yen')).toBeInTheDocument()
  })
})
