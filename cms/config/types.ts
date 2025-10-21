// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi Configuration Types
 * Provides proper type definitions for Strapi's env function
 */

/**
 * Strapi environment variable accessor with type-safe methods
 * Used in config files to read environment variables with defaults
 *
 * @example
 * const host = env('HOST', 'localhost')
 * const port = env.int('PORT', 3000)
 * const debug = env.bool('DEBUG', false)
 * const keys = env.array('API_KEYS', ['default'])
 */
export interface StrapiEnv {
  /**
   * Get string environment variable
   * @param key Environment variable name
   * @param defaultValue Default value if not found
   */
  (key: string, defaultValue?: string): string

  /**
   * Get integer environment variable
   * @param key Environment variable name
   * @param defaultValue Default value if not found
   */
  int(key: string, defaultValue?: number): number

  /**
   * Get boolean environment variable
   * @param key Environment variable name
   * @param defaultValue Default value if not found
   */
  bool(key: string, defaultValue?: boolean): boolean

  /**
   * Get array environment variable (comma-separated)
   * @param key Environment variable name
   * @param defaultValue Default value if not found
   */
  array(key: string, defaultValue?: string[]): string[]
}
