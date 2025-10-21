// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi admin panel configuration
 * Reference: T135 (Custom admin panel translation status field)
 */

import type { StrapiEnv } from './types'

export default ({ env }: { env: StrapiEnv }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'changeme-admin-jwt-secret-key-for-development'),
    sessions: {
      maxRefreshTokenLifespan: 30 * 24 * 60 * 60, // 30 days in seconds
      maxSessionLifespan: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'changeme-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'changeme-transfer-token-salt'),
    },
  },
})
