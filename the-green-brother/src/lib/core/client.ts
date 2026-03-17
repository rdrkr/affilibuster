// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * TheGreenBrother API Client
 *
 * Thin wrapper around the shared `@affilibuster/frontend` API client that
 * constrains generic type parameters to TheGreenBrother-specific
 * ApiRequest and ApiResponse union types.
 *
 * Feature-specific API functions (getHomepage, getNavigation, etc.) are provided
 * by feature modules in lib/language, lib/content, lib/preferences, lib/currency, etc.
 *
 * Compatible with SSG, Server Components, Client Components, Route Handlers, and Middleware.
 */

import {
  apiRequest as baseApiRequest,
  createApiRequest as baseCreateApiRequest,
  type ApiRequestAdditionalOptions,
} from '@affilibuster/frontend/lib/core/client'
import type { BaseApiRequest } from '@affilibuster/frontend/lib/core/api-types'
import { ApiError, type ApiRequest, type ApiResponse } from './api-types'

/**
 * Make a strongly-typed API request constrained to TheGreenBrother's API types.
 *
 * Delegates to the shared `@affilibuster/frontend` apiRequest with TGB-specific
 * ApiRequest and ApiResponse union type constraints.
 * @template T - The expected response type (must extend ApiResponse)
 * @param request - Typed request data with url/body/query/headers (ApiRequest instance)
 * @param options - Additional options (method, extra headers, credentials)
 * @returns Typed response data
 * @throws {ApiError} When the request fails or response status is not ok
 * @example
 * ```typescript
 * // GET request with query params
 * const request: HomepageGetHomepageData = {
 *   query: { locale: LanguageCode.EN, populate: '*' },
 *   url: '/homepage'
 * }
 * const response = await apiRequest<HomepageGetHomepageResponses[200]>(request)
 *
 * // POST request with body
 * const request: UpdateUserPreferencesData = {
 *   body: { selectedCurrency: 'EUR' },
 *   headers: { 'X-Session-Id': sessionId },
 *   url: '/user/preferences'
 * }
 * const result = await apiRequest<UpdateUserPreferencesResponses[200]>(
 *   request,
 *   { method: 'PUT' }
 * )
 *
 * // Auth request with credentials
 * const request: LoginUserData = {
 *   body: { email: 'user@example.com', password: 'secret' },
 *   url: '/auth/login'
 * }
 * const result = await apiRequest<LoginUserResponses[200]>(
 *   request,
 *   { method: 'POST', credentials: 'include' }
 * )
 * ```
 */
export async function apiRequest<T extends ApiResponse>(
  request: ApiRequest,
  options?: ApiRequestAdditionalOptions
): Promise<T> {
  return baseApiRequest<ApiRequest, T>(request, options)
}

/**
 * Helper function to create API request objects with explicit URL.
 * Automatically flattens nested query objects (filters, pagination, sort)
 * into Strapi bracket notation.
 * @template T - The request type (must extend ApiRequest)
 * @param url - The endpoint URL (e.g., '/homepage')
 * @param data - Request data without the URL property
 * @returns Complete request object with URL
 */
export function createApiRequest<T extends ApiRequest>(url: string, data: Omit<T, 'url'>): T {
  // The shared createApiRequest merges data + url and flattens query params.
  // It returns BaseApiRequest (via internal cast). We narrow to T here since
  // the caller provides T-compatible data and the url completes the shape.
  const base: BaseApiRequest = baseCreateApiRequest<T>(url, data)
  return base as T
}

// Re-export shared utilities that TGB feature modules need directly
export { getBaseUrl, getSessionId, type NextRequestConfig } from '@affilibuster/frontend/lib/core/client'

/**
 * Export ApiError for use in feature modules
 */
export { ApiError }
