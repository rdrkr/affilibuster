// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi server configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

import type { StrapiEnv } from './types'

// noinspection JSUnusedGlobalSymbols
export default ({ env }: { env: StrapiEnv }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('CMS_PORT'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: `${env('CMS_PROTOCOL')}://${env('CMS_HOST')}:${env('CMS_PORT')}`,
})
