// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi database configuration
 * Reference: T131 (Strapi i18n plugin configuration)
 */

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'postgres'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'affilibuster_cms'),
      user: env('DATABASE_USERNAME', 'affilibuster'),
      password: env('DATABASE_PASSWORD', 'affilibuster'),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    debug: false,
    pool: {
      min: 2,
      max: 10,
    },
  },
});
