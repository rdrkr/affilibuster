// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Custom Vite configuration for Strapi admin panel.
 *
 * This file extends the default Strapi admin Vite config to allow
 * additional hosts for local network development access.
 *
 * Reference: https://docs.strapi.io/dev-docs/admin-panel-customization#vite
 */

import { mergeConfig, type UserConfig } from 'vite'

/**
 * Vite configuration for Strapi admin panel.
 * @param config - Base Vite configuration from Strapi
 * @returns Modified Vite configuration with additional allowed hosts
 */
export default (config: UserConfig): UserConfig => {
  return mergeConfig(config, {
    server: {
      allowedHosts: ['strapi-proxy', 'strapi', 'localhost', 'rdrkr-mbp-m1.local'],
    },
  })
}
