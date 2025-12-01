// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi admin panel configuration
 * Reference: T135 (Custom admin panel translation status field)
 */

import type { StrapiEnv } from './types'

/**
 * Configure Strapi admin panel authentication and security settings.
 *
 * Configures JWT secrets, session lifespans, API token salts, and encryption keys
 * for secure admin panel access and API token generation.
 *
 * @param root0 - Configuration object
 * @param root0.env - Strapi environment configuration helper for accessing environment variables
 * @returns Admin panel configuration object
 */
export default ({ env }: { env: StrapiEnv }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      maxRefreshTokenLifespan: 30 * 24 * 60 * 60, // 30 days in seconds
      maxSessionLifespan: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  secrets: {
    encryptionKey: env('API_TOKEN_ENCRYPTION_KEY'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  vite: {
    server: {
      allowedHosts: ['strapi-proxy', 'strapi', 'localhost'],
    },
  },
})
