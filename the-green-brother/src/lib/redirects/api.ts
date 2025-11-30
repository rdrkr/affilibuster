// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Redirects API Module
 *
 * Provides functionality for checking URL redirects.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Used to check if a given URL path should redirect to another location.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type { CheckRedirectData, CheckRedirectResponses } from '@/lib/generated/types.gen'

/**
 * Check if a URL path should redirect
 * @param query - Query parameters containing the path to check
 * @returns The redirect response with target URL if redirect exists, or null if the request fails
 */
export async function checkRedirect(
  query: NonNullable<CheckRedirectData['query']>
): Promise<CheckRedirectResponses[200] | null> {
  try {
    const request = createApiRequest<CheckRedirectData>('/redirects/check', {
      query,
    })
    return await apiRequest<CheckRedirectResponses[200]>(request)
  } catch (error) {
    console.error('Failed to check redirect:', error)
    return null
  }
}
