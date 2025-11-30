// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Blog Post Tags API Module
 *
 * Provides high-level helper functions for fetching blog post tag data from the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Blog post tags are used to categorize and filter blog content.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type {
  BlogPostTagGetBlogPostTagsByIdData,
  BlogPostTagGetBlogPostTagsByIdResponses,
  BlogPostTagGetBlogPostTagsData,
  BlogPostTagGetBlogPostTagsResponses,
} from '@/lib/generated/types.gen'

/**
 * Get blog post tags (collection type)
 * @param query - Optional query parameters including locale, filters, pagination, sort, and populate
 * @returns The blog post tags data or null if the request fails
 */
export async function getBlogPostTags(
  query?: Omit<NonNullable<BlogPostTagGetBlogPostTagsData['query']>, 'customPopulate'>
): Promise<BlogPostTagGetBlogPostTagsResponses[200] | null> {
  try {
    const request = createApiRequest<BlogPostTagGetBlogPostTagsData>('/blog-post-tags', {
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    return await apiRequest<BlogPostTagGetBlogPostTagsResponses[200]>(request)
  } catch (error) {
    console.error('Failed to fetch blog post tags:', error)
    return null
  }
}

/**
 * Get single blog post tag by ID
 * @param id - Blog post tag document ID
 * @param query - Optional query parameters including locale and populate
 * @returns The blog post tag data or null if the request fails
 */
export async function getBlogPostTagById(
  id: string,
  query?: Omit<NonNullable<BlogPostTagGetBlogPostTagsByIdData['query']>, 'customPopulate'>
): Promise<BlogPostTagGetBlogPostTagsByIdResponses[200]['data'] | null> {
  try {
    const request = createApiRequest<BlogPostTagGetBlogPostTagsByIdData>(`/blog-post-tags/${id}`, {
      path: { id },
      query: {
        ...query,
        customPopulate: 'nested',
      },
    })
    const response = await apiRequest<BlogPostTagGetBlogPostTagsByIdResponses[200]>(request)
    return response.data
  } catch (error) {
    console.error(`Failed to fetch blog post tag ${id}:`, error)
    return null
  }
}
