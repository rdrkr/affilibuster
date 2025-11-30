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
 * @param root0 - Configuration object
 * @param root0.env - Strapi environment configuration helper for accessing environment variables
 * @returns Server configuration object with host, port, app keys, URL, and optional SSL
 */
export default ({ env }: { env: StrapiEnv }): ServerConfig => {
  // Strapi runs on HTTP internally; Nginx proxy handles HTTPS termination
  const protocol = env('CMS_PROTOCOL', 'http')
  const host = env('CMS_HOST')
  const port = env.int('CMS_PORT')

  // Build URL without port for HTTPS on standard port (443) to avoid redirect issues
  const portSuffix = protocol === 'https' && port === 443 ? '' : `:${port.toString()}`

  const config: ServerConfig = {
    host: env('HOST', '0.0.0.0'),
    port: port,
    app: {
      keys: env.array('APP_KEYS'),
    },
    // External URL - no port suffix for HTTPS on 443 (Render's public URL)
    url: `${protocol}://${host}${portSuffix}`,
  }

  // Note: Strapi does not natively support SSL.
  // SSL termination is handled by the Nginx reverse proxy (strapi-proxy service).
  // Strapi communicates with the proxy over HTTP internally, while the proxy
  // serves HTTPS to external clients. This is the recommended production pattern.

  return config
}
