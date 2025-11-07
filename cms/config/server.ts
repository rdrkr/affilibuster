// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi server configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

import type { StrapiEnv } from './types'

// noinspection JSUnusedGlobalSymbols
/**
 * Configure Strapi server settings including host, port, and application keys.
 *
 * Sets up the server binding address, port, application encryption keys,
 * and constructs the public URL for the CMS.
 *
 * @param root0 - Configuration object
 * @param root0.env - Strapi environment configuration helper for accessing environment variables
 * @returns Server configuration object with host, port, app keys, and URL
 */
export default ({ env }: { env: StrapiEnv }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('CMS_PORT'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: `${env('CMS_PROTOCOL')}://${env('CMS_HOST')}:${env('CMS_PORT')}`,
})
