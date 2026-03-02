// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { StrapiEnv } from './types'

/**
 * Strapi plugins configuration
 * Reference: T131 (Configure Strapi i18n plugin)
 * Reference: research.md:122-143 (3 languages: en, it, he)
 */

/**
 * Configure Strapi plugins including i18n, strapi-plugin-relation-filter, and GraphQL.
 *
 * Enables and configures the i18n plugin with support for English, Italian, and Hebrew locales.
 * Enables strapi-plugin-relation-filter plugin for filtering relation dropdowns based on pluginOptions.
 * GraphQL plugin is disabled but configuration is preserved for future use.
 * @param env - Strapi environment variables
 * @param env.env - Strapi environment variables
 * @returns Plugins configuration object with i18n, strapi-plugin-relation-filter, and GraphQL settings
 */
export default ({ env }: { env: StrapiEnv }) => ({
  // Relation filter plugin - filters relation dropdowns based on schema pluginOptions
  'strapi-plugin-relation-filter': {
    enabled: true,
    resolve: './src/plugins/strapi-plugin-relation-filter',
    config: {
      debug: env('NODE_ENV') === 'development',
    },
  },
  // i18n plugin configuration
  i18n: {
    enabled: true,
    config: {
      // Default locale
      defaultLocale: 'en',
      // Available locales matching our platform languages
      locales: ['en', 'it', 'he'],
    },
  },
  'strapi-plugin-nested-populator': {
    enabled: true,
    resolve: './src/plugins/strapi-plugin-nested-populator',
    config: {
      defaultDepth: 8,
    },
  },
  // Cloudinary upload provider - only enabled in production
  // In development, Strapi uses the default local filesystem provider
  ...(env('NODE_ENV') === 'production' && {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          upload: {},
          delete: {},
        },
      },
    },
  }),
})
