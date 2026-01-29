// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { RelationFilterConfig } from '../content-types'

/**
 * Default plugin configuration.
 * @returns Default configuration object for the strapi-plugin-relation-filter plugin
 */
export default {
  /**
   * Returns the default configuration for the strapi-plugin-relation-filter plugin.
   * @returns The default configuration with debug mode disabled
   */
  default: (): RelationFilterConfig => ({
    debug: false,
  }),

  /**
   * Validates the plugin configuration.
   * @param config - The configuration object to validate
   * @throws {Error} Error if configuration is invalid
   */
  validator: (config: RelationFilterConfig): void => {
    if (config.debug !== undefined && typeof config.debug !== 'boolean') {
      throw new Error('strapi-plugin-relation-filter: config.debug must be a boolean')
    }
  },
}
