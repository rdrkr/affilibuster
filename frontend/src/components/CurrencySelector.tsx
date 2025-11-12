// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency Selector Component
 * Reference: T110 (CurrencySelector component)
 * Allows users to select their preferred currency
 */

'use client'

import { useEffect, useState } from 'react'
import { getCurrencies, getNavigation } from '@/lib/client'
import type { CurrencyCode, Currency, Navigation } from '@/lib/types'
import { Dropdown, type DropdownItem } from '@/components/Dropdown'
import { useCurrency } from '@/lib/currency/useCurrency'

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const [currencies, setCurrencies] = useState<Currency[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [navData, setNavData] = useState<Navigation | null>(null)

  // Fetch available currencies from backend
  useEffect(() => {
    void getCurrencies()
      .then(currenciesData => {
        setCurrencies(currenciesData)
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Fetch navigation labels from CMS
  useEffect(() => {
    async function fetchNavigation() {
      try {
        const navContent = await getNavigation()
        if (navContent) {
          setNavData(navContent)
        }
      } catch (error) {
        console.error('Failed to fetch navigation:', error)
      }
    }
    void fetchNavigation()
  }, [])

  const handleCurrencyChange = (currencyCode: CurrencyCode): void => {
    setCurrency(currencyCode)
  }

  if (loading || !currencies) {
    return <div className="w-24 h-10 bg-primary-700 animate-pulse rounded-lg" />
  }

  const currencyItems: DropdownItem<CurrencyCode>[] = currencies.map(curr => ({
    value: curr.code as CurrencyCode,
    label: `${curr.symbol} ${curr.code}`,
  }))

  const currentCurrency = currencies.find(c => (c.code as CurrencyCode) === currency)

  return (
    <Dropdown
      value={currency}
      items={currencyItems}
      onChange={handleCurrencyChange}
      ariaLabel={navData?.currencySelectorAriaLabel ?? 'Select currency'}
      buttonClassName="flex items-center space-x-2 px-3 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap h-10"
      data-testid="currency-selector"
      itemTestIdPrefix="currency-option"
      renderTrigger={() => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentCurrency?.symbol} {currentCurrency?.code}
          </span>
          <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
      renderItem={item => <span>{item.label}</span>}
    />
  )
}
