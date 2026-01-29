// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Slug-based findOne controller utilities
 *
 * Provides factory functions for creating slug-based lookup handlers
 * that can be used across multiple content types.
 */

import type { Core, UID } from '@strapi/strapi'

import { factories } from '@strapi/strapi'

/**
 * Create a findOneBySlug handler for a given content type.
 *
 * This factory function returns a controller method that looks up a document
 * by its slug field instead of the document ID.
 * @param contentType - The Strapi content type UID (e.g., 'api::product.product')
 * @returns Controller method for slug-based lookup
 */
export function createFindOneBySlugHandler(contentType: UID.ContentType) {
  return async (ctx: Parameters<Core.ControllerHandler>[0]) => {
    const content = strapi.contentType(contentType)
    const { slug } = ctx.params as { slug?: string }

    const query: Record<string, unknown> = {
      status: 'published', // Default to published content, can be overridden by ctx.query
      ...ctx.query,
      filters: {
        ...(ctx.query.filters as Record<string, unknown>),
        slug,
      },
    }
    await strapi.contentAPI.validate.query(query, content, { auth: ctx.state.auth })
    const sanitizedQueryParams = await strapi.contentAPI.sanitize.query(query, content, {
      auth: ctx.state.auth,
    })

    const documents = await strapi.documents(content.uid).findFirst(sanitizedQueryParams)
    const sanitizedUtils = await strapi.contentAPI.sanitize.output(documents, content, {
      auth: ctx.state.auth,
    })

    return { data: sanitizedUtils, meta: {} }
  }
}

/**
 * Create a core controller with slug support.
 *
 * Wraps factories.createCoreController to add a findOneBySlug method.
 * @param contentType - The Strapi content type UID
 * @returns Strapi controller generic factory result
 */
export function createSlugCoreController(contentType: UID.ContentType) {
  return factories.createCoreController(contentType, () => ({
    findOneBySlug: createFindOneBySlugHandler(contentType),
  }))
}
