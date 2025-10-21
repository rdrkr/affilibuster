// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi database configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

import type { StrapiEnv } from './types'

export default ({ env }: { env: StrapiEnv }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('POSTGRES_HOST'),
      port: env.int('POSTGRES_PORT'),
      database: env('POSTGRES_CMS_NAME'),
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
