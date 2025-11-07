// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Centralized Language Configuration
 *
 * This module provides dynamic language configuration fetched from the backend API.
 * It eliminates hardcoded language values and makes the frontend truly dynamic.
 *
 * The backend `/v1/languages` endpoint is the single source of truth for supported languages.
 */

import { getLanguages } from '@/lib/client'
import type { CodeEnum, Language } from '@/lib/generated/types.gen'

/**
 * Cache for languages fetched from the backend API.
 * Populated on first call during build/runtime to avoid repeated API calls.
 */
let cachedLanguages: Language[] | null = null

/**
 * Get all supported languages from the backend API.
 *
 * This function fetches language configurations from the backend and caches the result.
 * It's designed for use in Next.js build-time functions like `generateStaticParams()`.
 *
 * **Strict Mode**: Fails fast if the backend is unreachable or returns no languages.
 * This ensures proper configuration and prevents silent failures during build.
 *
 * @returns Promise resolving to array of Language configurations
 * @throws {Error} If backend API is unreachable or returns empty language list
 *
 * @example
 * ```typescript
 * // In generateStaticParams()
 * export async function generateStaticParams() {
 *   const languages = await getAvailableLanguages()
 *   return languages.map(lang => ({ lang: lang.code }))
 * }
 * ```
 */
export async function getAvailableLanguages(): Promise<Language[]> {
  // Return cached value if available
  if (cachedLanguages !== null) {
    return cachedLanguages
  }

  // Fetch from backend API
  const languages = await getLanguages()

  // Strict mode: fail if no languages returned
  if (languages.length === 0) {
    throw new Error(
      'Failed to fetch languages from backend API. ' +
        'Ensure the backend is running and accessible at build time. ' +
        'Check NEXT_PUBLIC_API_URL and NEXT_SERVER_SIDE_API_URL environment variables.'
    )
  }

  // Cache the result
  cachedLanguages = languages
  return languages
}

/**
 * Get array of supported language codes (e.g., [CodeEnum.EN, CodeEnum.IT, CodeEnum.HE]).
 *
 * This is a convenience function for use cases that only need the language codes,
 * such as Next.js middleware configuration or validation logic.
 *
 * @returns Promise resolving to array of language code strings
 * @throws {Error} If backend API is unreachable or returns no languages
 *
 * @example
 * ```typescript
 * // In middleware or validation
 * const supportedCodes = await getLanguageCodes()
 * if (!supportedCodes.includes(userLocale)) {
 *   // Handle invalid locale
 * }
 * ```
 */
export async function getLanguageCodes(): Promise<CodeEnum[]> {
  const languages = await getAvailableLanguages()
  return languages.map(lang => lang.code)
}

/**
 * Get the default language configuration.
 *
 * Returns the language marked as `isDefault: true` in the backend API response.
 * If no default is marked, falls back to the first language in the list.
 *
 * @returns Promise resolving to the default Language configuration
 * @throws {Error} If backend API is unreachable or returns no languages
 *
 * @example
 * ```typescript
 * // In root redirect
 * const defaultLang = await getDefaultLanguage()
 * redirect(`/${defaultLang.code}`)
 * ```
 */
export async function getDefaultLanguage(): Promise<Language> {
  const languages = await getAvailableLanguages()
  const defaultLang = languages.find(lang => lang.isDefault)

  // If no default is set and array is empty, throw error
  if (!defaultLang && languages.length === 0) {
    throw new Error('No languages available and no default language set')
  }

  // If no default is set but languages exist, use first one
  // Since we checked for empty array above, we know languages[0] exists
  if (!defaultLang) {
    const fallbackLang = languages[0]
    if (!fallbackLang) {
      throw new Error('No languages available')
    }
    return fallbackLang
  }

  return defaultLang
}

/**
 * Get a specific language by its code.
 *
 * @param code - The language code to look up (e.g., CodeEnum.EN, CodeEnum.IT, CodeEnum.HE)
 * @returns Promise resolving to the Language configuration, or null if not found
 *
 * @example
 * ```typescript
 * const italian = await getLanguageByCode(CodeEnum.IT)
 * if (italian) {
 *   console.log(italian.displayName) // "Italian"
 *   console.log(italian.direction)   // "ltr"
 * }
 * ```
 */
export async function getLanguageByCode(code: CodeEnum): Promise<Language | null> {
  const languages = await getAvailableLanguages()
  return languages.find(lang => lang.code === code) ?? null
}

/**
 * Check if a language code is supported.
 *
 * @param code - The language code to validate
 * @returns Promise resolving to true if the language is supported, false otherwise
 *
 * @example
 * ```typescript
 * if (await isLanguageSupported('fr')) {
 *   // French is supported
 * } else {
 *   // French is not supported
 * }
 * ```
 */
export async function isLanguageSupported(code: CodeEnum): Promise<boolean> {
  const codes = await getLanguageCodes()
  return codes.includes(code)
}

/**
 * Clear the cached languages.
 *
 * This is primarily for testing purposes to force a fresh fetch from the API.
 * In production, the cache persists for the lifetime of the build/process.
 *
 * @internal
 */
export function clearLanguageCache(): void {
  cachedLanguages = null
}
