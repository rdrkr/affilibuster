// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi database configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

import type { StrapiEnv } from './types'

/**
 * Configure Strapi database connection settings.
 *
 * Sets up PostgreSQL connection with host, port, credentials, SSL configuration,
 * and connection pool settings for optimal performance.
 *
 * @param root0 - Configuration object
 * @param root0.env - Strapi environment configuration helper for accessing environment variables
 * @returns Database configuration object with connection settings
 */
export default ({ env }: { env: StrapiEnv }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('POSTGRES_HOST'),
      port: env.int('POSTGRES_PORT'),
      database: env('POSTGRES_DB'),
      user: env('POSTGRES_USER'),
      password: env('POSTGRES_PASSWORD'),
      ssl: env.bool('POSTGRES_SSL') && {
        rejectUnauthorized: env.bool('POSTGRES_SSL_REJECT_UNAUTHORIZED'),
      },
    },
    debug: false,
    pool: {
      min: 2,
      max: 10,
    },
  },
})
