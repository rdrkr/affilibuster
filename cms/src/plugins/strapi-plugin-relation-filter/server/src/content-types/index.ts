// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Type definitions for the strapi-plugin-relation-filter plugin.
 *
 * This module contains all TypeScript interfaces and types used
 * throughout the strapi-plugin-relation-filter plugin for type safety.
 */

/**
 * Configuration for the strapi-plugin-relation-filter plugin.
 */
export interface RelationFilterConfig {
  /** Enable debug logging */
  debug?: boolean
}

/**
 * Filter condition operators supported by Strapi REST API.
 */
export type FilterOperator =
  | '$eq'
  | '$ne'
  | '$lt'
  | '$lte'
  | '$gt'
  | '$gte'
  | '$in'
  | '$notIn'
  | '$contains'
  | '$notContains'
  | '$containsi'
  | '$notContainsi'
  | '$null'
  | '$notNull'
  | '$startsWith'
  | '$endsWith'
  | '$startsWithi'
  | '$endsWithi'

/**
 * Filter condition value with operator.
 */
export interface FilterCondition {
  [K: string]: FilterConditionValue
}

/**
 * Possible values for a filter condition.
 */
export type FilterConditionValue = string | number | boolean | null | string[] | number[] | FilterCondition

/**
 * Nested filter structure for relations.
 */
export interface RelationFilter {
  [relationField: string]: FilterCondition | RelationFilter
}

/**
 * Plugin options configuration for an attribute's strapi-plugin-relation-filter.
 */
export interface RelationFilterPluginOptions {
  /** Filters to apply when fetching available relations */
  filters: RelationFilter
}

/**
 * Attribute schema with optional strapi-plugin-relation-filter plugin options.
 */
export interface AttributeSchema {
  /** Attribute type (e.g., 'relation') */
  type: string
  /** Relation type (e.g., 'manyToOne', 'oneToOne') */
  relation?: string
  /** Target content type UID */
  target?: string
  /** Plugin-specific options */
  pluginOptions?: {
    'strapi-plugin-relation-filter'?: RelationFilterPluginOptions
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * Content type schema structure.
 */
export interface ContentTypeSchema {
  /** Content type kind */
  kind: 'collectionType' | 'singleType'
  /** Collection name in database */
  collectionName: string
  /** Content type info */
  info: {
    singularName: string
    pluralName: string
    displayName: string
    description?: string
  }
  /** Content type options */
  options: {
    draftAndPublish?: boolean
    [key: string]: unknown
  }
  /** Content type plugin options */
  pluginOptions?: Record<string, unknown>
  /** Attribute definitions */
  attributes: Record<string, AttributeSchema | undefined>
}

/**
 * Query filters structure used in Strapi REST API.
 */
export interface QueryFilters {
  /** AND conditions */
  $and?: QueryFilters[]
  /** OR conditions */
  $or?: QueryFilters[]
  /** Direct field filters */
  [field: string]: unknown
}

/**
 * Request query object with optional filters.
 */
export interface RequestQuery {
  /** Query filters */
  filters?: QueryFilters
  [key: string]: unknown
}

export default {}
