// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Feature Flag Definitions
 *
 * Define all feature flags for the application here.
 * Each flag uses the cmsAdapter to fetch values from the CMS.
 *
 * Usage in server components:
 * ```typescript
 * import { productSearchFlag } from '@/lib/feature-flags'
 *
 * export default async function Page() {
 *   const isEnabled = await productSearchFlag()
 *   return isEnabled ? <NewFeature /> : <LegacyFeature />
 * }
 * ```
 */

// The flags SDK types are not fully resolved by ESLint's strict type checking
// but work correctly at runtime. This is a known issue with some ESM packages.
import { flag } from 'flags/next'

import { cmsAdapter } from './adapter'

/**
 * Product Search Feature Flag
 * Enables/disables the search functionality.
 */
export const productSearchFlag = flag<boolean>({
  key: 'product-search',
  adapter: cmsAdapter(),
  defaultValue: false,
  description: 'Enables the product search functionality',
})

/**
 * User Profile Feature Flag
 * Enables/disables user profile sign up and sign in.
 */
export const userProfileFlag = flag<boolean>({
  key: 'user-profile',
  adapter: cmsAdapter(),
  defaultValue: false,
  description: 'Enable user profile sign up and sign in',
})
