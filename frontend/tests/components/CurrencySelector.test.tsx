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
import * as client from '@/lib/client'
import { useCurrency } from '@/lib/currency/useCurrency'
import { CurrencyCode } from '@/lib/types'

// Mock dependencies
jest.mock('@/lib/client', () => ({
  getCurrencies: jest.fn(),
  getNavigation: jest.fn(),
}))

jest.mock('@/lib/currency/useCurrency', () => ({
  useCurrency: jest.fn(),
}))

describe('CurrencySelector Component', () => {
  const mockCurrencies = [
    {
      code: CurrencyCode.USD,
      name: 'US Dollar',
      displayName: 'US Dollar ($)',
      symbol: '$',
      decimalPlaces: 2,
      symbolPosition: 'before' as const,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      sortOrder: 1,
    },
    {
      code: CurrencyCode.EUR,
      name: 'Euro',
      displayName: 'Euro (€)',
      symbol: '€',
      decimalPlaces: 2,
      symbolPosition: 'after' as const,
      thousandsSeparator: '.',
      decimalSeparator: ',',
      isActive: true,
      sortOrder: 2,
    },
    {
      code: CurrencyCode.ILS,
      name: 'Israeli Shekel',
      displayName: 'Israeli Shekel (₪)',
      symbol: '₪',
      decimalPlaces: 2,
      symbolPosition: 'before' as const,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      sortOrder: 3,
    },
  ]

  const mockSetCurrency = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.getCurrencies as jest.Mock).mockResolvedValue(mockCurrencies)
    ;(client.getNavigation as jest.Mock).mockResolvedValue({ currencySelectorAriaLabel: 'Select currency' })
    ;(useCurrency as jest.Mock).mockReturnValue({
      currency: CurrencyCode.EUR,
      setCurrency: mockSetCurrency,
    })
  })

  it('should render currency selector button', async () => {
    render(<CurrencySelector />)

    // Wait for currencies to load and button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /select currency/i })).toBeInTheDocument()
    })

    // Verify EUR is displayed (from useCurrency mock)
    expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
  })

  it('should display current currency from useCurrency hook', async () => {
    render(<CurrencySelector />)

    // Should load and display EUR (from useCurrency mock)
    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })
  })

  it('should display USD when useCurrency returns USD', async () => {
    ;(useCurrency as jest.Mock).mockReturnValue({
      currency: CurrencyCode.USD,
      setCurrency: mockSetCurrency,
    })

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/\$ USD/)).toBeInTheDocument()
    })
  })

  it('should display ILS when useCurrency returns ILS', async () => {
    ;(useCurrency as jest.Mock).mockReturnValue({
      currency: CurrencyCode.ILS,
      setCurrency: mockSetCurrency,
    })

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/₪ ILS/)).toBeInTheDocument()
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
    expect(screen.getAllByText('$ USD').length).toBeGreaterThan(0)
    expect(screen.getAllByText('€ EUR').length).toBeGreaterThan(0)
    expect(screen.getAllByText('₪ ILS').length).toBeGreaterThan(0)
  })

  it('should call useCurrency setCurrency when option is selected', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Click USD
    const usdOption = screen.getByRole('menuitem', { name: /\$ USD/i })
    fireEvent.click(usdOption)

    // Should call setCurrency from useCurrency hook
    expect(mockSetCurrency).toHaveBeenCalledWith(CurrencyCode.USD)
  })

  it('should update displayed currency when useCurrency value changes', async () => {
    const { rerender } = render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Simulate currency change from hook
    ;(useCurrency as jest.Mock).mockReturnValue({
      currency: CurrencyCode.ILS,
      setCurrency: mockSetCurrency,
    })

    rerender(<CurrencySelector />)

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

    // Click USD
    const usdOption = screen.getByRole('menuitem', { name: /\$ USD/i })
    fireEvent.click(usdOption)

    // Dropdown should close - USD option should no longer be visible
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /\$ USD/i })).not.toBeInTheDocument()
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
    expect(screen.getByRole('menuitem', { name: /\$ USD/i })).toBeInTheDocument()

    // Click backdrop
    const backdrop = document.querySelector('[aria-hidden="true"]')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /\$ USD/i })).not.toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    render(<CurrencySelector />)

    // Should show loading skeleton
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()
  })

  it('should display currency symbol and code', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      const buttonText = screen.getByRole('button', {
        name: /select currency/i,
      }).textContent
      // Should contain both symbol (€) and code (EUR)
      expect(buttonText).toContain('€')
      expect(buttonText).toContain(CurrencyCode.EUR)
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

    // Should show currency symbols and codes
    expect(screen.getAllByText('$ USD').length).toBeGreaterThan(0)
    expect(screen.getAllByText('€ EUR').length).toBeGreaterThan(0)
    expect(screen.getAllByText('₪ ILS').length).toBeGreaterThan(0)
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
    const euroButtons = screen.getAllByText('€ EUR')
    const euroButton = euroButtons
      .find(el => el.closest('button')?.getAttribute('role') === 'menuitem')
      ?.closest('button')

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
        code: CurrencyCode.GBP,
        name: 'British Pound',
        displayName: 'British Pound (£)',
        symbol: '£',
        decimalPlaces: 2,
        symbolPosition: 'before' as const,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        isActive: true,
        sortOrder: 4,
      },
      {
        code: CurrencyCode.JPY,
        name: 'Japanese Yen',
        displayName: 'Japanese Yen (¥)',
        symbol: '¥',
        decimalPlaces: 0,
        symbolPosition: 'before' as const,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        isActive: true,
        sortOrder: 5,
      },
    ]

    ;(client.getCurrencies as jest.Mock).mockResolvedValue(manyCurrencies)

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Open dropdown
    const button = screen.getByRole('button', { name: /select currency/i })
    fireEvent.click(button)

    // Should show all 5 currencies
    expect(screen.getAllByText('$ USD').length).toBeGreaterThan(0)
    expect(screen.getAllByText('€ EUR').length).toBeGreaterThan(0)
    expect(screen.getAllByText('₪ ILS').length).toBeGreaterThan(0)
    expect(screen.getAllByText('£ GBP').length).toBeGreaterThan(0)
    expect(screen.getAllByText('¥ JPY').length).toBeGreaterThan(0)
  })

  it('should handle navigation fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getNavigation as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch navigation:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  it('should handle null navigation response gracefully', async () => {
    ;(client.getNavigation as jest.Mock).mockResolvedValue(null)

    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Should still render with default aria label
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should handle getCurrencies error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getCurrencies as jest.Mock).mockRejectedValue(new Error('API error'))

    render(<CurrencySelector />)

    // Should still show loading state
    const loadingElement = document.querySelector('.animate-pulse')
    expect(loadingElement).toBeInTheDocument()

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('should have testid attributes for E2E testing', async () => {
    render(<CurrencySelector />)

    await waitFor(() => {
      expect(screen.getByText(/€ EUR/)).toBeInTheDocument()
    })

    // Button should have data-testid
    const button = screen.getByTestId('currency-selector')
    expect(button).toBeInTheDocument()

    // Open dropdown
    fireEvent.click(button)

    // Currency options should have test IDs
    expect(screen.getByTestId('currency-option-USD')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-EUR')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-ILS')).toBeInTheDocument()
  })
})
