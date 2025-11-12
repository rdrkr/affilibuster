// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency management hook
 * Manages currency selection with localStorage persistence and language-based defaults
 */

'use client'

import { getCurrency, setCurrency as saveCurrency } from '@/lib/core/storage'
import { CurrencyCode } from '@/lib/types'
import { useLocale } from 'next-intl'
import { useState } from 'react'

/**
 * Language-to-currency default mapping
 */
const LANGUAGE_DEFAULT_CURRENCY: Record<string, CurrencyCode> = {
  en: CurrencyCode.USD,
  it: CurrencyCode.EUR,
  he: CurrencyCode.ILS,
}

/**
 * Get default currency for a given language
 * @param language - The language code (e.g., 'en', 'it', 'he')
 * @returns The default currency code for that language
 */
export function getDefaultCurrencyForLanguage(language: string): CurrencyCode {
  return LANGUAGE_DEFAULT_CURRENCY[language] ?? CurrencyCode.USD
}

/**
 * Currency management hook
 * Provides current currency and methods to update it
 *
 * Priority order:
 * 1. localStorage (user's saved preference)
 * 2. Language-based default (en→USD, it→EUR, he→ILS)
 * 3. USD (fallback)
 *
 * @returns Object containing currency state and update function
 */
export function useCurrency() {
  const locale = useLocale()

  // Use state with locale as implicit dependency through initialization
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    // Initial state: check localStorage or use language default
    const stored = getCurrency()
    if (stored) {
      return stored
    }
    return getDefaultCurrencyForLanguage(locale)
  })

  // Track the locale that was used for initialization
  const [initializedLocale, setInitializedLocale] = useState(locale)

  // When locale changes and there's no stored preference, update the currency
  // This is done carefully to avoid synchronous setState in effect
  if (locale !== initializedLocale) {
    const stored = getCurrency()
    if (!stored) {
      // No stored preference - update to new language default
      const defaultCurrency = getDefaultCurrencyForLanguage(locale)
      setCurrencyState(defaultCurrency)
    }
    setInitializedLocale(locale)
  }

  /**
   * Update the selected currency and persist to localStorage
   * @param newCurrency - The new currency code to set
   */
  const updateCurrency = (newCurrency: CurrencyCode): void => {
    saveCurrency(newCurrency)
    setCurrencyState(newCurrency)
  }

  return {
    currency,
    setCurrency: updateCurrency,
  }
}
