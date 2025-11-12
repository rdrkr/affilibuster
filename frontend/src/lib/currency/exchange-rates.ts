// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency exchange rates and conversion utilities
 * Uses static exchange rates for client-side price conversion
 */

import { CurrencyCode } from '@/lib/types'

/**
 * Exchange rates relative to USD (base currency = 1.0)
 * These are approximate rates for demonstration purposes
 * In production, these would be fetched from an API and updated regularly
 */
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  [CurrencyCode.USD]: 1.0, // Base currency
  [CurrencyCode.EUR]: 0.92,
  [CurrencyCode.ILS]: 3.65,
  [CurrencyCode.GBP]: 0.79,
  [CurrencyCode.CAD]: 1.36,
  [CurrencyCode.AUD]: 1.53,
  [CurrencyCode.JPY]: 149.5,
  [CurrencyCode.CNY]: 7.24,
}

/**
 * Convert an amount from one currency to another
 * @param amount - The amount to convert
 * @param from - The source currency code
 * @param to - The target currency code
 * @returns The converted amount
 *
 * @example
 * ```typescript
 * // Convert $100 USD to EUR
 * const euros = convertCurrency(100, CurrencyCode.USD, CurrencyCode.EUR)
 * // Result: 92 (approximately)
 * ```
 */
export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) {
    return amount
  }

  const fromRate = EXCHANGE_RATES[from]
  const toRate = EXCHANGE_RATES[to]

  if (!fromRate || !toRate) {
    console.warn(`Missing exchange rate for ${from} or ${to}, returning original amount`)
    return amount
  }

  // Convert from source currency to USD, then to target currency
  const usdAmount = amount / fromRate
  return usdAmount * toRate
}

/**
 * Get the exchange rate between two currencies
 * @param from - The source currency code
 * @param to - The target currency code
 * @returns The exchange rate (how much 1 unit of 'from' equals in 'to')
 *
 * @example
 * ```typescript
 * const rate = getExchangeRate(CurrencyCode.USD, CurrencyCode.EUR)
 * // Result: 0.92 (1 USD = 0.92 EUR)
 * ```
 */
export function getExchangeRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) {
    return 1.0
  }

  return convertCurrency(1.0, from, to)
}
