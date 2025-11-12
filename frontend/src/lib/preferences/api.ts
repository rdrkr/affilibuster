// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Preferences API Module
 *
 * Provides functions for managing user preferences (currency, language, etc.).
 */

import type {
  GetUserPreferencesData,
  GetUserPreferencesResponses,
  UpdatePreferences,
  UpdateUserPreferencesData,
  UpdateUserPreferencesResponses,
  UserPreferences,
} from '@/lib/generated/types.gen'
import { apiRequest, createApiRequest, getSessionId } from '@/lib/core/client'

/**
 * Get user preferences by session ID.
 *
 * Fetches the current user's preferences including selected currency and language.
 *
 * @returns User preferences object or null on error
 *
 * @example
 * ```typescript
 * const prefs = await getUserPreferences()
 * console.log(`User's currency: ${prefs?.selectedCurrency}`)
 * ```
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const sessionId = getSessionId()
    const request = createApiRequest<GetUserPreferencesData>('/user/preferences', {
      headers: {
        'X-Session-Id': sessionId,
      },
    })
    return await apiRequest<GetUserPreferencesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch user preferences:', error)
    return null
  }
}

/**
 * Update user preferences.
 *
 * Updates the current user's preferences (currency, language, etc.).
 * Requires a valid session ID in the request headers.
 *
 * @param data - Partial preferences data to update
 * @returns Updated user preferences or null on error
 *
 * @example
 * ```typescript
 * const updated = await updateUserPreferences({ selectedCurrency: 'EUR' })
 * console.log(`Updated currency: ${updated?.selectedCurrency}`)
 * ```
 */
export async function updateUserPreferences(data: Partial<UpdatePreferences>): Promise<UserPreferences | null> {
  try {
    const sessionId = getSessionId()
    const request = createApiRequest<UpdateUserPreferencesData>('/user/preferences', {
      body: data,
      headers: {
        'X-Session-Id': sessionId,
      },
    })
    return await apiRequest<UpdateUserPreferencesResponses[200]>(request, { method: 'PUT' })
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    return null
  }
}
