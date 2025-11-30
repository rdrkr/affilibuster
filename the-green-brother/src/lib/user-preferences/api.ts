// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * User Preferences API Module
 *
 * Provides high-level helper functions for managing user preferences.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * User preferences include settings like selected currency, theme, language, etc.
 * Preferences are stored server-side and associated with the user's session.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  GetUserPreferencesData,
  GetUserPreferencesResponses,
  UpdateUserPreferencesData,
  UpdateUserPreferencesResponses,
} from '@/lib/generated/types.gen'

/**
 * Get the current user's preferences
 * @param sessionId - Session ID for authentication
 * @returns The user preferences or null if the request fails
 */
export async function getUserPreferences(sessionId: string): Promise<GetUserPreferencesResponses[200] | null> {
  try {
    const request = createApiRequest<GetUserPreferencesData>('/user/preferences', {
      headers: { 'X-Session-Id': sessionId },
    })
    return await apiRequest<GetUserPreferencesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to get user preferences:', error)
    return null
  }
}

/**
 * Update the current user's preferences
 * @param sessionId - Session ID for authentication
 * @param body - Preference data to update
 * @returns Updated user preferences or null if update fails
 */
export async function updateUserPreferences(
  sessionId: string,
  body: NonNullable<UpdateUserPreferencesData['body']>
): Promise<UpdateUserPreferencesResponses[200] | null> {
  try {
    const request = createApiRequest<UpdateUserPreferencesData>('/user/preferences', {
      body,
      headers: { 'X-Session-Id': sessionId },
    })
    return await apiRequest<UpdateUserPreferencesResponses[200]>(request, {
      method: 'PUT',
    })
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    return null
  }
}
