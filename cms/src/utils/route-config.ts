// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Route configuration utilities
 *
 * Provides environment-aware route configuration for Strapi APIs.
 * In production, routes are restricted to read-only operations.
 * In development, all CRUD operations are enabled for testing.
 */

type RouteAction = 'find' | 'findOne' | 'create' | 'update' | 'delete'

interface RouterConfig {
  only?: RouteAction[]
}

/**
 * Check if the current environment is production.
 * @returns True if NODE_ENV is 'production', false otherwise.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get route configuration that applies restrictions only in production.
 *
 * In production: restricts routes to specified actions only.
 * In development: returns empty config (all actions enabled).
 * @param actions - The actions to allow in production (e.g., ['find'] or ['find', 'findOne'])
 * @returns Router configuration object
 */
export function getProductionOnlyConfig(actions: RouteAction[]): RouterConfig {
  return isProduction() ? { only: actions } : {}
}
