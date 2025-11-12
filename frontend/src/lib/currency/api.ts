// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency API Module
 *
 * Provides functions for fetching currency data and exchange rates.
 */

import type { Currency, CurrencyGetCurrenciesData, CurrencyGetCurrenciesResponses } from '@/lib/generated/types.gen'
import { apiRequest, createApiRequest } from '@/lib/core/client'

/**
 * Get all active currencies.
 *
 * Fetches the list of all currencies supported by the platform with their
 * exchange rates, symbols, and display information.
 *
 * @returns Array of currency configurations, or empty array on error
 *
 * @example
 * ```typescript
 * const currencies = await getCurrencies()
 * currencies.forEach(curr => console.log(`${curr.code}: ${curr.symbol}`))
 * ```
 */
export async function getCurrencies(): Promise<Currency[]> {
  try {
    const request = createApiRequest<CurrencyGetCurrenciesData>('/currencies', {})
    const response = await apiRequest<CurrencyGetCurrenciesResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error('Failed to fetch currencies:', error)
    return []
  }
}
