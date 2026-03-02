// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { Core, UID } from '@strapi/strapi'
import type { ModelAttribute, PopulateTreeResult, PopulateValue, StrapiModel } from '../content-types'

/** Plugin key for identifying this plugin in Strapi's plugin registry. */
const PLUGIN_KEY = 'strapi-plugin-nested-populator'

/**
 * Interface for accessing plugin configuration.
 * Strapi's default plugin type does not expose config() with proper return types.
 */
interface PluginInstance {
  /** Retrieves a configuration value by key. */
  config: (key: string) => unknown
}

/**
 * Extracts model attributes, filtering out the 'related' field for upload.file models.
 *
 * The 'related' field on `plugin::upload.file` causes circular references
 * and is excluded to prevent infinite recursion during population.
 * @param model - The Strapi model schema
 * @returns The model's attributes, with 'related' excluded for upload.file
 */
const extractModelAttributes = (model: StrapiModel): Record<string, ModelAttribute> => {
  if (model.uid === 'plugin::upload.file') {
    return Object.fromEntries(Object.entries(model.attributes).filter(([key]) => key !== 'related'))
  }
  return model.attributes
}

/**
 * Recursively builds a Strapi populate object for nested content structures.
 *
 * Traverses the model schema and builds a deep populate tree that includes
 * components, dynamic zones, relations, and media fields. Uses depth limiting
 * and an ignore list to prevent infinite recursion from circular references.
 *
 * Dynamic zones use Strapi 5's fragment API (`on` syntax) for per-component
 * population, as required since Strapi 5.37.0.
 * @param strapi - The Strapi core instance
 * @param modelUid - The UID of the model to build the populate tree for
 * @param maxDepth - Maximum recursion depth (defaults to 20)
 * @param ignore - Collection names to skip for circular reference prevention
 * @returns The populate tree result: `true` for simple fields, a {@link PopulateObject}
 *   for nested structures, or `undefined` if the model should be skipped
 */
export const buildPopulateTree = (
  strapi: Core.Strapi,
  modelUid: string,
  maxDepth = 20,
  ignore: string[] = []
): PopulateTreeResult => {
  const plugin = strapi.plugin(PLUGIN_KEY) as unknown as PluginInstance
  const skipCreatorFields = Boolean(plugin.config('skipCreatorFields'))

  if (maxDepth <= 1) return true
  if (modelUid === 'admin::user' && skipCreatorFields) return undefined

  const populate: Record<string, PopulateValue> = {}
  const model = strapi.getModel(modelUid as UID.Schema) as unknown as StrapiModel

  if (!ignore.includes(model.collectionName)) {
    ignore.push(model.collectionName)
  }

  for (const [key, value] of Object.entries(extractModelAttributes(model))) {
    if (ignore.includes(key)) continue

    switch (value.type) {
      case 'component': {
        if (value.component) {
          const componentResult = buildPopulateTree(strapi, value.component, maxDepth - 1)
          if (componentResult !== undefined) {
            populate[key] = componentResult
          }
        }
        break
      }

      case 'dynamiczone': {
        if (value.components) {
          const fragments: Record<string, PopulateValue> = {}

          for (const comp of value.components) {
            const componentResult = buildPopulateTree(strapi, comp, maxDepth - 1)
            if (componentResult !== undefined) {
              fragments[comp] = componentResult
            }
          }

          populate[key] = Object.keys(fragments).length === 0 ? true : { on: fragments }
        }
        break
      }

      case 'relation': {
        if (value.target) {
          const relationResult = buildPopulateTree(
            strapi,
            value.target,
            key === 'localizations' && maxDepth > 2 ? 1 : maxDepth - 1,
            ignore
          )

          if (relationResult !== undefined) {
            populate[key] = relationResult
          }
        }
        break
      }

      case 'media': {
        populate[key] = true
        break
      }

      default:
        break
    }
  }

  return Object.keys(populate).length === 0 ? true : { populate }
}
