// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Product Tags API Module
 *
 * Provides high-level helper functions for fetching product tag data from the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Product tags are used to categorize and filter product content.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  ProductTagGetProductTagsByIdData,
  ProductTagGetProductTagsByIdResponses,
  ProductTagGetProductTagsData,
  ProductTagGetProductTagsResponses,
} from '@/lib/generated/types.gen'

/**
 * Get product tags (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The product tags data or null if the request fails
 */
export async function getProductTags(
  query?: Omit<NonNullable<ProductTagGetProductTagsData['query']>, 'customPopulate'>
): Promise<ProductTagGetProductTagsResponses[200] | null> {
  try {
    const request = createApiRequest<ProductTagGetProductTagsData>('/product-tags', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<ProductTagGetProductTagsResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch product tags:', error)
    return null
  }
}

/**
 * Get single product tag by ID
 * @param id - Product tag document ID
 * @param query - Optional query parameters including locale and populate
 * @returns The product tag data or null if the request fails
 */
export async function getProductTagById(
  id: string,
  query?: Omit<NonNullable<ProductTagGetProductTagsByIdData['query']>, 'customPopulate'>
): Promise<ProductTagGetProductTagsByIdResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<ProductTagGetProductTagsByIdData>(`/product-tags/${id}`, {
      path: { id },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<ProductTagGetProductTagsByIdResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch product tag ${id}:`, error)
    return null
  }
}
