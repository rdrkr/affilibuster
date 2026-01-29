// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { Core } from '@strapi/strapi'
import { mergeFilters, isEmptyFilters } from './utils/filter-merger'
import type { RelationFilter, RequestQuery } from './content-types'

/** Plugin key for identifying this plugin. */
const PLUGIN_KEY = 'strapi-plugin-relation-filter'

/**
 * Interface for relations controller context.
 */
interface RelationsContext {
  params: {
    model: string
    targetField: string
    id?: string
  }
  request: {
    query: RequestQuery
  }
}

/**
 * Interface for the filter service.
 */
interface FilterService {
  getFiltersForAttribute: (sourceUid: string, attributeName: string) => RelationFilter | null
}

/**
 * Interface for plugin with service method.
 */
interface PluginWithService {
  service: (name: string) => FilterService | undefined
  config: (key: string) => unknown
}

/**
 * Original findAvailable handler type.
 */
type FindAvailableHandler = (ctx: RelationsContext) => Promise<unknown>

/**
 * Relations controller interface.
 */
interface RelationsController {
  findAvailable?: FindAvailableHandler
}

/**
 * Content-manager plugin interface.
 */
interface ContentManagerPlugin {
  controller: (name: string) => RelationsController | undefined
}

/**
 * Registers the plugin and overrides the content-manager's relations controller.
 * This is called during Strapi's register phase, before bootstrap.
 * @param context - Strapi context containing the strapi instance
 * @param context.strapi - The Strapi core instance
 */
const register = ({ strapi }: { strapi: Core.Strapi }): void => {
  strapi.log.info(`[${PLUGIN_KEY}] Registering plugin...`)

  // Get the content-manager plugin
  const contentManager = strapi.plugin('content-manager') as unknown as ContentManagerPlugin | undefined

  if (!contentManager) {
    strapi.log.error(`[${PLUGIN_KEY}] content-manager plugin not found!`)
    return
  }

  // Get the relations controller
  const relationsController = contentManager.controller('relations')

  if (!relationsController) {
    strapi.log.error(`[${PLUGIN_KEY}] relations controller not found in content-manager!`)
    return
  }

  // Store the original findAvailable handler
  const originalHandler = relationsController.findAvailable

  if (!originalHandler) {
    strapi.log.error(`[${PLUGIN_KEY}] findAvailable method not found on relations controller!`)
    return
  }

  // Capture in a const that TypeScript knows is defined
  const originalFindAvailable: FindAvailableHandler = originalHandler

  strapi.log.info(`[${PLUGIN_KEY}] Overriding findAvailable handler...`)

  /**
   * Extended findAvailable handler that applies relation filters.
   * @param ctx - Koa context with params and request query
   * @returns Promise resolving to the filtered relations
   */
  async function findAvailableWithFilter(this: unknown, ctx: RelationsContext): Promise<unknown> {
    const { model: sourceUid, targetField: attributeName } = ctx.params

    strapi.log.info(`[${PLUGIN_KEY}] findAvailable called for ${sourceUid}.${attributeName}`)

    // Get our plugin
    const plugin = strapi.plugin(PLUGIN_KEY) as unknown as PluginWithService | undefined

    if (!plugin) {
      strapi.log.warn(`[${PLUGIN_KEY}] Plugin not available, using original handler`)
      return await originalFindAvailable.call(this, ctx)
    }

    // Get the filter service
    const filterService = plugin.service('service')

    if (!filterService) {
      strapi.log.warn(`[${PLUGIN_KEY}] Service not found, using original handler`)
      return await originalFindAvailable.call(this, ctx)
    }

    // Get debug mode
    const debug = Boolean(plugin.config('debug'))

    // Get filters for this attribute
    const filters = filterService.getFiltersForAttribute(sourceUid, attributeName)

    if (!filters || isEmptyFilters(filters)) {
      if (debug) {
        strapi.log.debug(`[${PLUGIN_KEY}] No filters for ${sourceUid}.${attributeName}`)
      }
      return await originalFindAvailable.call(this, ctx)
    }

    // Log filter application
    strapi.log.info(`[${PLUGIN_KEY}] Applying filters to ${sourceUid}.${attributeName}:`, JSON.stringify(filters))

    // Merge filters into the request query
    ctx.request.query.filters = mergeFilters(ctx.request.query.filters, filters)

    if (debug) {
      strapi.log.info(`[${PLUGIN_KEY}] Final query filters:`, JSON.stringify(ctx.request.query.filters))
    }

    // Call original handler with modified query
    return await originalFindAvailable.call(this, ctx)
  }

  relationsController.findAvailable = findAvailableWithFilter

  strapi.log.info(`[${PLUGIN_KEY}] Plugin registered successfully!`)
}

export default register
