// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency Selector Component
 * Reference: T110 (CurrencySelector component)
 * Allows users to select their preferred currency
 */

'use client'

import { useEffect, useState } from 'react'
import { getCurrencies, getUserPreferences, updateUserPreferences, getNavigation } from '@/lib/client'
import { useSession } from '@/hooks/useSession'
import type { Currency, CurrencyCode } from '@/lib/types'
import { Dropdown, type DropdownItem } from '@/components/Dropdown'

interface NavigationData {
  currencySelectorAriaLabel?: string
}

export function CurrencySelector() {
  const sessionId = useSession()
  const [currencies, setCurrencies] = useState<Currency[] | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [navData, setNavData] = useState<NavigationData>({})

  useEffect(() => {
    if (!sessionId) return

    // Fetch currencies and user preferences
    void Promise.all([getCurrencies(), getUserPreferences().catch(() => null)])
      .then(([currenciesData, prefsData]) => {
        setCurrencies(currenciesData)
        if (prefsData) {
          setSelectedCurrency(prefsData.selectedCurrency)
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId])

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

  const handleCurrencyChange = (currencyCode: CurrencyCode) => {
    void (async () => {
      try {
        await updateUserPreferences({ selectedCurrency: currencyCode })
        setSelectedCurrency(currencyCode)
      } catch (error) {
        console.error('Failed to update currency:', error)
      }
    })()
  }

  if (loading || !currencies) {
    return <div className="w-24 h-10 bg-primary-700 animate-pulse rounded-lg" />
  }

  const currencyItems: DropdownItem<CurrencyCode>[] = currencies.map(currency => ({
    value: currency.code as CurrencyCode,
    label: `${currency.symbol} ${currency.code}`,
  }))

  const currentCurrency = currencies.find(c => c.code === selectedCurrency)

  return (
    <Dropdown
      value={selectedCurrency as CurrencyCode}
      items={currencyItems}
      onChange={handleCurrencyChange}
      ariaLabel={navData.currencySelectorAriaLabel ?? 'Select currency'}
      buttonClassName="flex items-center space-x-2 px-3 py-2 bg-primary-700 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap h-10"
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
