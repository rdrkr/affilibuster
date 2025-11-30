// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { apiRequest, createApiRequest } from '@/lib/core/client'
import type {
  DetectLanguageData,
  DetectLanguageResponses,
  GetLanguagesData,
  GetLanguagesResponses,
} from '@/lib/generated/types.gen'

/**
 * Language operations
 */

/**
 * Get available languages with display info
 *
 * Returns languages with flags and display names from the backend API.
 * @returns The languages array or null if the request fails
 */
export async function getLanguages(): Promise<GetLanguagesResponses[200] | null> {
  try {
    const request: GetLanguagesData = createApiRequest<GetLanguagesData>('/languages', {})
    return await apiRequest<GetLanguagesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch Languages:', error)
    return null
  }
}

/**
 * Detect language from browser headers
 *
 * Analyzes Accept-Language header and returns the best matching supported language.
 * @param body - Body parameters for language detection (acceptLanguage required)
 * @returns The detected language or null if detection fails
 */
export async function detectLanguage(
  body: NonNullable<DetectLanguageData['body']>
): Promise<DetectLanguageResponses[200] | null> {
  try {
    const request = createApiRequest<DetectLanguageData>('/languages/detect', {
      body,
    })
    return await apiRequest<DetectLanguageResponses[200]>(request, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to detect language:', error)
    return null
  }
}
