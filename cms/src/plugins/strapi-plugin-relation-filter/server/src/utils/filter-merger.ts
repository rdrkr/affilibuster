// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { QueryFilters, RelationFilter } from '../content-types'

/**
 * Utility functions for merging and manipulating query filters.
 * This module provides functions to safely merge relation filters
 * into existing query filter structures.
 */

/**
 * Merges relation filters into an existing query filters object.
 * This function adds the provided relation filters to the $and array
 * of the query filters, ensuring proper filter combination without
 * overwriting existing conditions.
 * @param existingFilters - The current query filters object (may be undefined)
 * @param newFilters - The relation filters to merge in
 * @returns A new QueryFilters object with merged filters
 * @example
 * ```typescript
 * const existing = { $and: [{ status: { $eq: 'published' } }] };
 * const newFilter = { roles: { roleId: { $eq: 'author' } } };
 * const merged = mergeFilters(existing, newFilter);
 * // Result: { $and: [{ status: { $eq: 'published' } }, { roles: { roleId: { $eq: 'author' } } }] }
 * ```
 */
export function mergeFilters(existingFilters: QueryFilters | undefined, newFilters: RelationFilter): QueryFilters {
  // If no existing filters, create new structure with $and
  if (!existingFilters) {
    return {
      $and: [newFilters as QueryFilters],
    }
  }

  // Clone existing filters to avoid mutation
  const result: QueryFilters = { ...existingFilters }

  // Ensure $and array exists
  if (!result.$and) {
    result.$and = []
  } else {
    // Clone the array to avoid mutation
    result.$and = [...result.$and]
  }

  // Add new filters to the $and array
  result.$and.push(newFilters as QueryFilters)

  return result
}

/**
 * Checks if a filters object is empty or has no meaningful conditions.
 * @param filters - The filters object to check
 * @returns True if the filters object is empty or undefined
 */
export function isEmptyFilters(filters: RelationFilter | undefined | null): boolean {
  if (!filters) {
    return true
  }

  return Object.keys(filters).length === 0
}
