// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { apiRequest, createApiRequest } from '@/lib/core/client'
import type {
  CurrencyGetCurrenciesByIdData,
  CurrencyGetCurrenciesByIdResponses,
  CurrencyGetCurrenciesData,
  CurrencyGetCurrenciesResponses,
} from '@/lib/generated/types.gen'

/**
 * Get currencies (collection type)
 * @param query - Optional query parameters including filters, pagination, and sort
 * @returns The currencies data or null if the request fails
 */
export async function getCurrencies(
  query?: Omit<NonNullable<CurrencyGetCurrenciesData['query']>, 'customPopulate'>
): Promise<CurrencyGetCurrenciesResponses[200] | null> {
  try {
    const request = createApiRequest<CurrencyGetCurrenciesData>('/currencies', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<CurrencyGetCurrenciesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch currencies:', error)
    return null
  }
}

/**
 * Get single currency by ID
 * @param id - Currency document ID
 * @param query - Optional query parameters including populate
 * @returns The currency data or null if the request fails
 */
export async function getCurrencyById(
  id: string,
  query?: Omit<NonNullable<CurrencyGetCurrenciesByIdData['query']>, 'customPopulate'>
): Promise<CurrencyGetCurrenciesByIdResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<CurrencyGetCurrenciesByIdData>(`/currencies/${id}`, {
      path: { id },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<CurrencyGetCurrenciesByIdResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch currency ${id}:`, error)
    return null
  }
}
