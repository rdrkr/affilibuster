// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi server configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', ['changeme-app-key1', 'changeme-app-key2']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  url: env('PUBLIC_URL', 'http://localhost:1337'),
});
