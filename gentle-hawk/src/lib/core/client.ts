// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * GentleHawk API Client
 *
 * Thin wrapper around the shared frontend API client that constrains
 * request/response types to GentleHawk's specific API surface.
 */

import {
  apiRequest as baseApiRequest,
  createApiRequest as baseCreateApiRequest,
} from '@affilibuster/frontend/lib/core/client'
import type { ApiRequestAdditionalOptions } from '@affilibuster/frontend/lib/core/client'
import type { ApiRequest, ApiResponse } from './api-types'

export { ApiError, type ApiRequest, type ApiResponse } from './api-types'
export { getBaseUrl, getSessionId } from '@affilibuster/frontend/lib/core/client'

/**
 * Type-safe API request function for GentleHawk.
 * Constrains the generic shared client to GentleHawk's API surface.
 * @param request - The API request matching GentleHawk's ApiRequest union
 * @param options - Additional request options (method, headers, etc.)
 * @returns Promise resolving to the typed response
 */
export async function apiRequest<T extends ApiResponse>(
  request: ApiRequest,
  options?: ApiRequestAdditionalOptions
): Promise<T> {
  return baseApiRequest<ApiRequest, T>(request, options)
}

/**
 * Create a type-safe API request object for GentleHawk.
 * @param url - The API endpoint URL path
 * @param data - Request data (query params, body, headers)
 * @returns Typed API request object
 */
export function createApiRequest<T extends ApiRequest>(url: T['url'], data: Omit<T, 'url'>): T {
  return baseCreateApiRequest<T>(url, data)
}
