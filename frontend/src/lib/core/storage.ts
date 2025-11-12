// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * localStorage utilities for persisting user preferences
 * Provides type-safe access to browser localStorage
 */

import type { CurrencyCode } from '@/lib/types'

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  CURRENCY: 'affilibuster_currency',
  LANGUAGE: 'affilibuster_language',
} as const

/**
 * Get the user's selected currency from localStorage
 * @returns The stored currency code, or null if not set
 */
export function getCurrency(): CurrencyCode | null {
  /* istanbul ignore next: SSR guard - cannot test typeof window === undefined in JSDOM */
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(STORAGE_KEYS.CURRENCY)
  return stored as CurrencyCode | null
}

/**
 * Save the user's selected currency to localStorage
 * @param currency - The currency code to save
 */
export function setCurrency(currency: CurrencyCode): void {
  /* istanbul ignore next: SSR guard - cannot test typeof window === undefined in JSDOM */
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEYS.CURRENCY, currency)
}

/**
 * Remove the currency preference from localStorage
 */
export function removeCurrency(): void {
  /* istanbul ignore next: SSR guard - cannot test typeof window === undefined in JSDOM */
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEYS.CURRENCY)
}

/**
 * Get the user's selected language from localStorage
 * @returns The stored language code, or null if not set
 */
export function getLanguage(): string | null {
  /* istanbul ignore next: SSR guard - cannot test typeof window === undefined in JSDOM */
  if (typeof window === 'undefined') return null

  return localStorage.getItem(STORAGE_KEYS.LANGUAGE)
}

/**
 * Save the user's selected language to localStorage
 * @param language - The language code to save (e.g., 'en', 'it', 'he')
 */
export function setLanguage(language: string): void {
  /* istanbul ignore next: SSR guard - cannot test typeof window === undefined in JSDOM */
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)
}

/**
 * Remove the language preference from localStorage
 */
export function removeLanguage(): void {
  /* istanbul ignore next: SSR guard - cannot test typeof window === undefined in JSDOM */
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEYS.LANGUAGE)
}
