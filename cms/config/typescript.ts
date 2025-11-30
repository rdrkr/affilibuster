// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi TypeScript configuration
 * Enables automatic type generation for Strapi schemas
 */

/**
 * Configure Strapi TypeScript settings.
 *
 * Enables automatic TypeScript type generation for Strapi content-type schemas,
 * ensuring type safety when working with Strapi models in TypeScript code.
 * @returns TypeScript configuration object with autogenerate setting
 */
export default () => ({
  autogenerate: true,
})
