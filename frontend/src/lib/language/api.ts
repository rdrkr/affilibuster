// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language API Module
 *
 * Provides functions for language detection and fetching supported languages.
 */

import type {
  DetectedLanguage,
  DetectLanguageData,
  DetectLanguageResponses,
  GetLanguagesData,
  GetLanguagesResponses,
  Language,
} from '@/lib/generated/types.gen'
import { apiRequest, createApiRequest } from '@/lib/core/client'

/**
 * Get all supported languages.
 *
 * @returns Array of supported language configurations, or empty array on error
 *
 * @example
 * ```typescript
 * const languages = await getLanguages()
 * languages.forEach(lang => console.log(lang.displayName))
 * ```
 */
export async function getLanguages(): Promise<Language[]> {
  try {
    const request = createApiRequest<GetLanguagesData>('/languages', {})
    return await apiRequest<GetLanguagesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch languages:', error)
    return []
  }
}

/**
 * Detect user's preferred language from browser headers.
 *
 * Uses Accept-Language header, User-Agent, and optional country code
 * to determine the best language match for the user.
 *
 * @param acceptLanguage - Browser's Accept-Language header value
 * @param userAgent - Optional browser User-Agent string
 * @param countryCode - Optional ISO country code from IP geolocation
 * @returns Detected language with confidence score, or null on error
 *
 * @example
 * ```typescript
 * const detected = await detectLanguage('it-IT,it;q=0.9,en;q=0.8')
 * if (detected && detected.shouldPrompt) {
 *   // Show language switch prompt
 * }
 * ```
 */
export async function detectLanguage(
  acceptLanguage: string,
  userAgent?: string,
  countryCode?: string
): Promise<DetectedLanguage | null> {
  try {
    const request = createApiRequest<DetectLanguageData>('/languages/detect', {
      body: {
        acceptLanguage,
        ...(userAgent !== undefined && { userAgent }),
        ...(countryCode !== undefined && { countryCode }),
      },
    })
    return await apiRequest<DetectLanguageResponses[200]>(request, { method: 'POST' })
  } catch (error) {
    console.error('Failed to detect language:', error)
    return null
  }
}
