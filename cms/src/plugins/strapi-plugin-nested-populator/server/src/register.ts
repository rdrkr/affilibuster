// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { Core } from '@strapi/strapi'
import type { PopulateObject } from './content-types'
import { buildPopulateTree } from './utils'

/** Plugin key for identifying this plugin in Strapi's plugin registry. */
const PLUGIN_KEY = 'strapi-plugin-nested-populator'

/** Fallback default depth when plugin configuration is unavailable. */
const DEFAULT_DEPTH_FALLBACK = 5

/**
 * Interface for accessing plugin configuration.
 * Strapi's default plugin type does not expose config() with proper return types.
 */
interface PluginInstance {
  /** Retrieves a configuration value by key. */
  config: (key: string) => unknown
}

/**
 * Determines whether a populate tree result is a {@link PopulateObject}
 * with nested populate fields rather than a simple `true` value.
 * @param result - The populate tree result to check
 * @returns True if the result is a PopulateObject with a populate property
 */
const isPopulateObject = (result: true | PopulateObject | undefined): result is PopulateObject =>
  result !== undefined && result !== true

/**
 * Register phase - sets up Document Service middleware for nested population.
 *
 * Uses `strapi.documents.use()` to intercept `findMany`, `findOne`, and `findFirst`
 * actions before Strapi's parameter allowlisting strips custom query parameters.
 * When `customPopulate === 'nested'` is found in the request params, it builds
 * a deep populate tree and sets `params.populate` accordingly.
 *
 * This approach replaces the previous `strapi.db.lifecycles.subscribe` pattern
 * which stopped working in Strapi 5.37.0+ due to the introduction of
 * `pickAllowedQueryParams` in the Document Service query transformer.
 * @param context - Strapi context containing the strapi instance
 * @param context.strapi - The Strapi core instance
 */
const register = ({ strapi }: { strapi: Core.Strapi }): void => {
  strapi.documents.use(async (ctx, next) => {
    if (ctx.action !== 'findMany' && ctx.action !== 'findOne' && ctx.action !== 'findFirst') {
      return next()
    }

    const params = ctx.params as unknown as Record<string, unknown>
    const customPopulate = params.customPopulate as string | undefined
    const customDepth = params.customDepth as number | undefined
    const customIgnored = params.customIgnored as string[] | undefined

    if (customPopulate !== 'nested') return next()

    const plugin = strapi.plugin(PLUGIN_KEY) as unknown as PluginInstance
    const defaultDepth = (plugin.config('defaultDepth') ?? DEFAULT_DEPTH_FALLBACK) as number
    const defaultIgnored = (plugin.config('ignore') ?? []) as string[]

    const depth = customDepth !== undefined && customDepth > 0 ? customDepth : defaultDepth
    const ignored = customIgnored ? [...customIgnored] : [...defaultIgnored]
    const populateResult = buildPopulateTree(strapi, ctx.uid, depth, ignored)

    if (isPopulateObject(populateResult)) {
      params.populate = populateResult.populate
    }

    // Clean up custom params to prevent downstream validation issues.
    // Strapi 5.37.0+ strips unrecognized params via pickAllowedQueryParams,
    // but explicit cleanup ensures compatibility across versions.
    delete params.customPopulate
    delete params.customDepth
    delete params.customIgnored

    return next()
  })
}

export default register
