// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { Core } from '@strapi/strapi'
import type { ContentTypeSchema, RelationFilter } from '../content-types'

/**
 * Service for extracting relation filters from content type schemas.
 * This service reads the pluginOptions configuration from attribute
 * schemas to determine what filters should be applied when fetching
 * available relations for dropdown fields.
 */

/** Plugin options key for strapi-plugin-relation-filter configuration. */
const PLUGIN_OPTIONS_KEY = 'strapi-plugin-relation-filter'

/**
 * Plugin with config method returning unknown.
 */
interface PluginWithConfig {
  config: (key: string) => unknown
}

/**
 * Creates the strapi-plugin-relation-filter service factory.
 * @param context - Strapi context containing the strapi instance
 * @param context.strapi - The Strapi core instance
 * @returns Service object with filter extraction methods
 */
const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Extracts relation filters from a content type attribute's pluginOptions.
   * Reads the schema for the specified content type and attribute,
   * then returns the configured filters from pluginOptions['strapi-plugin-relation-filter'].
   * @param sourceUid - The source content type UID (e.g., 'api::blog-post.blog-post')
   * @param attributeName - The attribute name to get filters for (e.g., 'contributor')
   * @returns The configured filters or null if no filters are configured
   * @example
   * ```typescript
   * const filters = service.getFiltersForAttribute('api::blog-post.blog-post', 'contributor');
   * // Returns: { roles: { roleId: { $eq: 'author' } } }
   * // Or null if no filters configured
   * ```
   */
  getFiltersForAttribute(sourceUid: string, attributeName: string): RelationFilter | null {
    const plugin = strapi.plugin(PLUGIN_OPTIONS_KEY) as PluginWithConfig
    const debug = Boolean(plugin.config('debug'))

    // Always log to help debug - can be removed later
    strapi.log.info(`[strapi-plugin-relation-filter] Looking for filters: ${sourceUid}.${attributeName}`)

    try {
      // Get the content type schema
      const contentType = strapi.contentTypes[sourceUid as keyof typeof strapi.contentTypes] as unknown as
        | ContentTypeSchema
        | undefined

      if (!contentType) {
        strapi.log.warn(`[strapi-plugin-relation-filter] Content type not found: ${sourceUid}`)
        return null
      }

      // Get the attribute schema
      const attribute = contentType.attributes[attributeName]

      if (!attribute) {
        strapi.log.warn(`[strapi-plugin-relation-filter] Attribute not found: ${attributeName} on ${sourceUid}`)
        return null
      }

      // Log the attribute structure to understand what we're working with
      strapi.log.info(
        `[strapi-plugin-relation-filter] Attribute structure for ${attributeName}:`,
        JSON.stringify(attribute, null, 2)
      )

      // Check if it's a relation type
      if (attribute.type !== 'relation') {
        if (debug) {
          strapi.log.debug(`[strapi-plugin-relation-filter] Attribute ${attributeName} is not a relation type`)
        }
        return null
      }

      // Extract strapi-plugin-relation-filter plugin options
      const pluginOptions = attribute.pluginOptions?.[PLUGIN_OPTIONS_KEY]

      strapi.log.info(
        `[strapi-plugin-relation-filter] pluginOptions for ${attributeName}:`,
        JSON.stringify(attribute.pluginOptions, null, 2)
      )

      if (!pluginOptions?.filters) {
        strapi.log.info(`[strapi-plugin-relation-filter] No filters configured for ${sourceUid}.${attributeName}`)
        return null
      }

      strapi.log.info(
        `[strapi-plugin-relation-filter] Found filters for ${sourceUid}.${attributeName}:`,
        JSON.stringify(pluginOptions.filters)
      )

      return pluginOptions.filters
    } catch (error) {
      strapi.log.error(
        `[strapi-plugin-relation-filter] Error getting filters for ${sourceUid}.${attributeName}:`,
        error
      )
      return null
    }
  },
})

export default service
