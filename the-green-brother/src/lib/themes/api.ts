// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Themes API Module
 *
 * Provides high-level helper functions for fetching theme data from the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Themes represent UI themes or visual style configurations for the application.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  ThemeGetThemesByIdData,
  ThemeGetThemesByIdResponses,
  ThemeGetThemesData,
  ThemeGetThemesResponses,
} from '@/lib/generated/types.gen'

/**
 * Get themes (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The themes data or null if the request fails
 */
export async function getThemes(
  query?: Omit<NonNullable<ThemeGetThemesData['query']>, 'customPopulate'>
): Promise<ThemeGetThemesResponses[200] | null> {
  try {
    const request = createApiRequest<ThemeGetThemesData>('/themes', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<ThemeGetThemesResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch themes:', error)
    return null
  }
}

/**
 * Get single theme by ID
 * @param id - Theme document ID
 * @param query - Optional query parameters including locale and populate
 * @returns The theme data or null if the request fails
 */
export async function getThemeById(
  id: string,
  query?: Omit<NonNullable<ThemeGetThemesByIdData['query']>, 'customPopulate'>
): Promise<ThemeGetThemesByIdResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ThemeGetThemesByIdData>(`/themes/${id}`, {
      path: { id },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<ThemeGetThemesByIdResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch theme ${id}:`, error)
    return null
  }
}
