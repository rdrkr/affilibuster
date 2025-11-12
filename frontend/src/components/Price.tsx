// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Price Component
 * Reference: T117 (Price component - currency formatting)
 * Formats prices with currency symbols and locale-specific formatting
 */

'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { getCurrencies } from '@/lib/client'
import { useCurrency } from '@/lib/currency/useCurrency'
import { convertCurrency } from '@/lib/currency/exchange-rates'
import type { Currency } from '@/lib/types'
import { CurrencyCode, SymbolPositionEnum } from '@/lib/generated/types.gen'

interface PriceProps {
  amount: number
  currencyCode?: string
  showCurrencyCode?: boolean
  className?: string
}

export function Price({
  amount,
  currencyCode = CurrencyCode.USD,
  showCurrencyCode = true,
  className = '',
}: PriceProps) {
  const locale = useLocale()
  const { currency: selectedCurrency } = useCurrency()
  const [currencies, setCurrencies] = useState<Currency[] | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch all currencies from backend
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

  if (loading || !currencies) {
    return (
      <span className={`inline-block h-6 w-16 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded ${className}`} />
    )
  }

  // Find currency details for both source and target currencies
  const sourceCurrency = currencies.find(c => c.code === currencyCode)
  const targetCurrency = currencies.find(c => (c.code as CurrencyCode) === selectedCurrency)

  if (!sourceCurrency || !targetCurrency) {
    return <span className={className}>{amount}</span>
  }

  // Convert price to selected currency
  const convertedAmount = convertCurrency(amount, currencyCode as CurrencyCode, selectedCurrency)

  // Format the number with proper decimal places and locale-specific formatting
  const formatted = convertedAmount.toLocaleString(locale, {
    minimumFractionDigits: targetCurrency.decimalPlaces,
    maximumFractionDigits: targetCurrency.decimalPlaces,
    useGrouping: true,
  })

  // Apply currency-specific separators (override locale defaults if needed)
  const localizedNumber = formatted
    .replace(/,/g, '###THOUSAND###')
    .replace(/\./g, targetCurrency.decimalSeparator)
    .replace(/###THOUSAND###/g, targetCurrency.thousandsSeparator)

  // Position symbol according to currency configuration
  const display =
    targetCurrency.symbolPosition === SymbolPositionEnum.BEFORE
      ? `${targetCurrency.symbol}${localizedNumber}`
      : `${localizedNumber} ${targetCurrency.symbol}`

  return (
    <span className={`font-medium ${className}`} data-testid="price">
      {display}
      {showCurrencyCode && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">{targetCurrency.code}</span>
      )}
    </span>
  )
}
