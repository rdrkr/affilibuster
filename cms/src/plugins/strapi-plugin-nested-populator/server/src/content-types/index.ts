// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Type definitions for the strapi-plugin-nested-populator plugin.
 *
 * This module contains all TypeScript interfaces and types used
 * throughout the strapi-plugin-nested-populator plugin for type safety.
 */

import type { UID } from '@strapi/strapi'

/**
 * Configuration for the strapi-plugin-nested-populator plugin.
 */
export interface NestedPopulatorConfig {
  /** Maximum depth for recursive population. Defaults to 6. */
  defaultDepth?: number
  /** Field names to ignore during population. */
  ignore?: string[]
  /** Whether to skip admin::user creator fields. Defaults to true. */
  skipCreatorFields?: boolean
}

/**
 * Strapi model attribute definition.
 */
export interface ModelAttribute {
  /** The attribute type (e.g., 'component', 'relation', 'media', 'string'). */
  type: string
  /** Component UID, present when type is 'component'. */
  component?: string
  /** Component UIDs, present when type is 'dynamiczone'. */
  components?: string[]
  /** Target model UID, present when type is 'relation'. */
  target?: string
  /** Additional attribute properties. */
  [key: string]: unknown
}

/**
 * Strapi model schema used for building populate trees.
 */
export interface StrapiModel {
  /** Model unique identifier (e.g., 'api::article.article'). */
  uid: string
  /** Database collection name. */
  collectionName: string
  /** Model attribute definitions. */
  attributes: Record<string, ModelAttribute>
}

/**
 * Recursive populate object for Strapi queries.
 */
export interface PopulateObject {
  /** Nested population field definitions. */
  populate: Record<string, PopulateValue>
}

/**
 * Fragment-based populate for dynamic zones and polymorphic relations.
 * Uses Strapi 5's fragment API to specify per-component population.
 *
 * Required since Strapi 5.37.0 which no longer allows specific field targeting
 * within polymorphic structures via the `populate` key directly.
 */
export interface FragmentPopulate {
  /** Per-component populate definitions keyed by component UID. */
  on: Record<string, PopulateValue>
}

/**
 * Possible values for a populate field entry.
 * - `true` signals simple population without further nesting.
 * - A {@link PopulateObject} defines nested population fields.
 * - A {@link FragmentPopulate} defines per-component population for dynamic zones.
 */
export type PopulateValue = true | PopulateObject | FragmentPopulate

/**
 * Result of {@link buildPopulateTree}.
 * - `true` when no further nesting is needed.
 * - A {@link PopulateObject} for nested population.
 * - `undefined` when the field should be skipped entirely (e.g., admin::user with skipCreatorFields).
 */
export type PopulateTreeResult = true | PopulateObject | undefined

/**
 * Document Service middleware context.
 * Represents the context object passed to middlewares registered via `strapi.documents.use()`.
 */
export interface DocumentServiceContext {
  /** The content type UID being operated on. */
  uid: UID.Schema
  /** The Document Service action being performed (e.g., 'findMany', 'findOne', 'findFirst'). */
  action: string
  /** The parameters for the action. May contain custom query params before transformation. */
  params: Record<string, unknown>
}

export default {}
