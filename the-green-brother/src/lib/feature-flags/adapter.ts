// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Feature Flags Adapter
 *
 * Custom adapter for Vercel Flags SDK that integrates with our
 * CMS-based feature flag system via the backend API.
 */

import type { Adapter } from 'flags'
import { cache } from 'react'

import { getFeatureFlags, type FeatureFlagsResponse } from './api'

/**
 * Determines if the current environment is production
 * @returns true if NODE_ENV is 'production', false otherwise
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Cached fetch function - deduplicates API calls per request
 */
const getCachedFlags = cache(async (): Promise<Map<string, boolean>> => {
  const response: FeatureFlagsResponse | null = await getFeatureFlags()
  const map = new Map<string, boolean>()

  if (!response?.data) {
    return map
  }

  const useProductionFlags = isProduction()

  for (const flag of response.data) {
    // Select the appropriate enabled state based on environment
    const enabled: boolean = useProductionFlags ? flag.productionEnabled === true : flag.developmentEnabled === true
    map.set(flag.key, enabled)
  }

  return map
})

/**
 * Creates a custom adapter for Vercel Flags SDK that fetches
 * feature flag values from our CMS via the backend API.
 *
 * The adapter uses React cache() to deduplicate requests.
 * @returns Adapter instance for use with flag() declarations
 */
export function cmsAdapter(): Adapter<boolean, unknown> {
  return {
    async decide({ key }: { key: string }): Promise<boolean> {
      const flags = await getCachedFlags()
      return flags.get(key) ?? false
    },
  }
}
// clearFlagsCache removed as it is handled by Next.js request lifecycle
