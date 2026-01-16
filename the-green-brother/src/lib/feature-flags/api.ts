// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Feature Flags API Client
 *
 * Fetches feature flags from the backend API.
 * The backend proxies requests to Strapi CMS with caching.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'
import type { FeatureFlagGetFeatureFlagsData, FeatureFlagGetFeatureFlagsResponses } from '@/lib/generated/types.gen'

/** Feature flag data item from the API response */
export type FeatureFlag = FeatureFlagGetFeatureFlagsResponses[200]['data'][number]

/** Feature flags API response */
export type FeatureFlagsResponse = FeatureFlagGetFeatureFlagsResponses[200]

/**
 * Fetches all feature flags from the backend API.
 *
 * Uses the auto-generated CMS proxy endpoint which includes
 * Redis caching (5 minute TTL by default).
 * @returns The feature flags response or null if request fails
 */
export async function getFeatureFlags(): Promise<FeatureFlagsResponse | null> {
  try {
    const request = createApiRequest<FeatureFlagGetFeatureFlagsData>('/feature-flags', {
      query: {
        customPopulate: 'nested',
      },
    })
    return await apiRequest<FeatureFlagsResponse>(request, {
      cache: 'no-store',
    })
  } catch (error) {
    console.error('Failed to fetch feature flags:', error)
    return null
  }
}
