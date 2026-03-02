// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { NestedPopulatorConfig } from '../content-types'

/**
 * Default plugin configuration and validator.
 * @returns Default configuration object for the strapi-plugin-nested-populator plugin
 */
export default {
  /**
   * Returns the default configuration for the strapi-plugin-nested-populator plugin.
   * @returns The default configuration with depth 6, empty ignore list, and skipCreatorFields enabled
   */
  default: (): NestedPopulatorConfig => ({
    defaultDepth: 6,
    ignore: [],
    skipCreatorFields: true,
  }),

  /**
   * Validates the plugin configuration.
   * @param config - The configuration object to validate
   * @throws {Error} Error if any configuration value has an invalid type
   */
  validator: (config: NestedPopulatorConfig): void => {
    if (config.defaultDepth !== undefined && typeof config.defaultDepth !== 'number') {
      throw new Error('strapi-plugin-nested-populator: config.defaultDepth must be a number')
    }
    if (config.defaultDepth !== undefined && config.defaultDepth < 1) {
      throw new Error('strapi-plugin-nested-populator: config.defaultDepth must be at least 1')
    }
    if (config.ignore !== undefined && !Array.isArray(config.ignore)) {
      throw new Error('strapi-plugin-nested-populator: config.ignore must be an array')
    }
    if (config.skipCreatorFields !== undefined && typeof config.skipCreatorFields !== 'boolean') {
      throw new Error('strapi-plugin-nested-populator: config.skipCreatorFields must be a boolean')
    }
  },
}
