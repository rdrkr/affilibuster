// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi server configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

import type { StrapiEnv } from './types'

/**
 * Strapi server configuration interface.
 */
interface ServerConfig {
  host: string
  port: number
  app: {
    keys: string[]
  }
  url: string
}

// noinspection JSUnusedGlobalSymbols
/**
 * Configure Strapi server settings including host, port, and application keys.
 *
 * Sets up the server binding address, port, application encryption keys,
 * and constructs the public URL for the CMS. Adds SSL configuration when HTTPS is enabled.
 *
 * @param root0 - Configuration object
 * @param root0.env - Strapi environment configuration helper for accessing environment variables
 * @returns Server configuration object with host, port, app keys, URL, and optional SSL
 */
export default ({ env }: { env: StrapiEnv }): ServerConfig => {
  // Strapi runs on HTTP internally; Nginx proxy handles HTTPS termination
  const protocol = env('CMS_PROTOCOL', 'http')
  const config: ServerConfig = {
    host: env('HOST', '0.0.0.0'),
    port: env.int('CMS_PORT'),
    app: {
      keys: env.array('APP_KEYS'),
    },
    // External URL (through proxy) uses HTTPS, but Strapi itself runs on HTTP
    url: `${protocol}://${env('CMS_HOST')}:${env('CMS_PORT')}`,
  }

  // Note: Strapi does not natively support SSL.
  // SSL termination is handled by the Nginx reverse proxy (strapi-proxy service).
  // Strapi communicates with the proxy over HTTP internally, while the proxy
  // serves HTTPS to external clients. This is the recommended production pattern.

  return config
}
