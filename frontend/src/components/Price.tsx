// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Price Component
 * Reference: T117 (Price component - currency formatting)
 * Formats prices with currency symbols and locale-specific formatting
 */

'use client'

import { useEffect, useState } from 'react'
import { getCurrencies, getUserPreferences } from '@/lib/client'
import { useSession } from '@/hooks/useSession'
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
  const sessionId = useSession()
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) return

    // Get user's preferred currency and all currencies
    void Promise.all([getCurrencies(), getUserPreferences().catch(() => null)])
      .then(([currencies, prefs]) => {
        const targetCurrency = prefs?.selectedCurrency ?? currencyCode
        const found = currencies.find((c: Currency) => c.code === targetCurrency)
        setCurrency(found ?? null)
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      })
  }, [sessionId, currencyCode])

  if (loading) {
    return (
      <span className={`inline-block h-6 w-16 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded ${className}`} />
    )
  }

  if (!currency) {
    return <span className={className}>{amount}</span>
  }

  // Format the number with proper decimal places
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
    useGrouping: true,
  })

  // Apply currency-specific separators
  const localizedNumber = formatted
    .replace(/,/g, '###THOUSAND###')
    .replace(/\./g, currency.decimalSeparator)
    .replace(/###THOUSAND###/g, currency.thousandsSeparator)

  // Position symbol
  const display =
    currency.symbolPosition === SymbolPositionEnum.BEFORE
      ? `${currency.symbol}${localizedNumber}`
      : `${localizedNumber} ${currency.symbol}`

  return (
    <span className={`font-medium ${className}`}>
      {display}
      {showCurrencyCode && <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">{currency.code}</span>}
    </span>
  )
}
