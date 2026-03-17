// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Feature Flags Module
 *
 * GentleHawk minimal feature flag stubs.
 * Returns hardcoded defaults until feature flag infrastructure is wired up.
 */

/**
 * Product Search Feature Flag.
 * @returns Whether product search is enabled
 */
export function productSearchFlag(): Promise<boolean> {
  return Promise.resolve(false)
}

/**
 * User Profile Feature Flag.
 * @returns Whether user profile features are enabled
 */
export function userProfileFlag(): Promise<boolean> {
  return Promise.resolve(false)
}
