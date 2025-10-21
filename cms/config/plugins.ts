// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi plugins configuration
 * Reference: T131 (Configure Strapi i18n plugin)
 * Reference: research.md:122-143 (3 languages: en, it, he)
 */

export default () => ({
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

  // GraphQL plugin (optional, useful for content queries)
  graphql: {
    enabled: false,
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 100,
    },
  },
})
