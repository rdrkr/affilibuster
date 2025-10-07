// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi admin panel configuration
 * Reference: T135 (Custom admin panel translation status field)
 */

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'changeme-admin-jwt-secret-key-for-development'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'changeme-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'changeme-transfer-token-salt'),
    },
  },
});
