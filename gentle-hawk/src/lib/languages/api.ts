// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { apiRequest, createApiRequest } from '@/lib/core/client'
import type { GetLanguagesData, GetLanguagesResponses } from '@/lib/generated/types.gen'

/**
 * Get available languages with display info.
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
