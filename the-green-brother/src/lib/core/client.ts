// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Core API Client Infrastructure
 *
 * Provides the foundation for all API operations with:
 * - Type-safe request/response handling via ApiRequest and ApiResponse types
 * - Automatic serialization and deserialization
 * - Session ID management for client-side requests
 * - Centralized error handling with ApiError
 *
 * Feature-specific API functions (getHomepage, getNavigation, etc.) are provided
 * by feature modules in lib/language, lib/content, lib/preferences, lib/currency, etc.
 *
 * Compatible with SSG, Server Components, Client Components, Route Handlers, and Middleware.
 */

import { ApiError, type ApiRequest, type ApiResponse } from './api-types'

/**
 * Additional options for API requests (method, extra headers).
 *
 * Used alongside the typed ApiRequest parameter.
 */
interface ApiRequestAdditionalOptions {
  /**
   * HTTP method (GET, POST, PUT, etc.)
   */
  method?: string
  /**
   * Additional custom headers to merge with request headers
   */
  headers?: Record<string, string>
  /**
   * Credentials mode for fetch request
   * - 'include': Include credentials (cookies) in cross-origin requests (required for auth)
   * - 'same-origin': Only include credentials for same-origin requests (default)
   * - 'omit': Never include credentials
   */
  credentials?: RequestCredentials
  /**
   * Cache mode for the request
   * - 'force-cache': Cache the response (default for GET)
   * - 'no-store': Don't cache the response
   */
  cache?: RequestCache
  /**
   * Next.js specific request configuration
   */
  next?: NextRequestConfig
}

/**
 * Next.js extended fetch options
 */
export interface NextRequestConfig {
  revalidate?: number | false
  tags?: string[]
}

/**
 * Get base URL for API requests
 * Respects NEXT_PUBLIC_API_URL environment variable
 * Automatically adjusts for test environments (host.docker.internal)
 * @returns The base URL string for API requests
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: check if we're in a test environment (Playwright via Docker)
    // If accessing via host.docker.internal, use that for backend too
    /* istanbul ignore next -- E2E test environment only, covered by Playwright tests */
    if (window.location.hostname === 'host.docker.internal') {
      const protocol = window.location.protocol // https: or http:
      return `${protocol}//host.docker.internal:8000/v1`
    }
    // Normal client-side: use NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/v1'
  }
  // Server-side: browser accessible
  /* istanbul ignore next -- SSR code path, tested in production during build/SSR */
  return process.env.NEXT_SERVER_SIDE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/v1'
}

/**
 * Get session ID from localStorage (client-side only)
 * Returns empty string during SSR/build time
 * @returns The session ID string
 */
export function getSessionId(): string {
  /* istanbul ignore next -- SSR code path, tested in production during build/SSR */
  if (typeof window === 'undefined') {
    return ''
  }

  let sessionId = localStorage.getItem('affilibuster_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('affilibuster_session_id', sessionId)
  }
  return sessionId
}

/**
 * Serialize query parameters into a query string
 * @param query - Record of query parameters to serialize
 * @returns Query string starting with '?' or empty string if no params
 */
function serializeQuery(query?: Record<string, unknown>): string {
  if (!query || Object.keys(query).length === 0) {
    return ''
  }

  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle arrays - append each item as separate parameter
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null) {
            params.append(key, String(item))
          }
        })
      } else if (typeof value === 'object') {
        // Handle objects (non-arrays) - JSON stringify
        params.append(key, JSON.stringify(value))
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        params.append(key, value.toString())
      } else if (typeof value === 'string') {
        params.append(key, value)
      }
      // Skip other types (e.g., symbols, functions) as they shouldn't be in query params
    }
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Make a strongly-typed API request.
 *
 * This function follows the backend repository pattern with:
 * - Strong typing via ApiRequest and ApiResponse constraints
 * - Automatic serialization of query params, request body, and headers
 * - Automatic deserialization of JSON responses
 * - Centralized error handling with ApiError
 * - Single source of truth: endpoint URL extracted from request.url property
 *
 * Serialization/deserialization is completely hidden from the caller.
 * Callers instantiate typed request objects and receive typed responses.
 *
 * Feature modules (lib/content, lib/language, lib/preferences, lib/currency) use
 * this function internally and expose domain-specific helper functions.
 * @template T - The expected response type (must extend ApiResponse)
 * @param request - Typed request data with url/body/query/headers (ApiRequest instance)
 * @param options - Additional options (method, extra headers, credentials)
 * @returns Typed response data
 * @throws {ApiError} When the request fails or response status is not ok
 * @example
 * ```typescript
 * // GET request with query params
 * const request: HomepageGetHomepageData = {
 *   query: { locale: CodeEnum.EN, populate: '*' },
 *   url: '/homepage'  // Single source of truth
 * }
 * const response = await apiRequest<HomepageGetHomepageResponses[200]>(request)
 *
 * // POST request with body
 * const request: UpdateUserPreferencesData = {
 *   body: { selectedCurrency: 'EUR' },
 *   headers: { 'X-Session-Id': sessionId },
 *   url: '/user/preferences'  // Single source of truth
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
 *   { method: 'POST', credentials: 'include' }  // Required for auth cookies
 * )
 * ```
 */
export async function apiRequest<T extends ApiResponse>(
  request: ApiRequest,
  options?: ApiRequestAdditionalOptions
): Promise<T> {
  const baseUrl = getBaseUrl()

  // Extract endpoint from request.url property (single source of truth)
  // All ApiRequest types have a url property, but TypeScript can't infer this from the union
  const endpoint: string = (request as { url: string }).url

  // Extract query params from request and serialize (hidden from caller)
  const queryParams: Record<string, unknown> | undefined =
    'query' in request ? (request as { query?: Record<string, unknown> }).query : undefined
  const url = `${baseUrl}${endpoint}${serializeQuery(queryParams)}`

  // Build headers: start with defaults, add request headers, add session ID, merge additional headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add headers from request (hidden extraction)
  if ('headers' in request) {
    Object.assign(headers, (request as { headers: Record<string, string> }).headers)
  }

  // Add session ID for client-side requests
  const sessionId = getSessionId()
  if (sessionId) {
    headers['X-Session-Id'] = sessionId
  }

  // Merge additional headers from options
  if (options?.headers) {
    Object.assign(headers, options.headers)
  }

  const fetchOptions: RequestInit & { next?: NextRequestConfig } = {
    method: options?.method ?? 'GET',
    headers,
    credentials: options?.credentials ?? 'same-origin',
    ...(options?.cache !== undefined && { cache: options.cache }),
    ...(options?.next !== undefined && { next: options.next }),
  }

  // Extract and serialize request body to JSON (hidden from caller)
  if ('body' in request) {
    const bodyContainer = request as { body?: unknown }
    if (bodyContainer.body !== undefined) {
      fetchOptions.body = JSON.stringify(bodyContainer.body)
    }
  }

  // Execute request
  const response: Response = await fetch(url, fetchOptions)

  // Handle errors
  if (!response.ok) {
    // Provide user-friendly error messages for common authentication errors
    let errorMessage = `API request failed: ${response.statusText}`

    if (response.status === 401) {
      // Unauthorized - provide more helpful message for authentication endpoints
      if (url.includes('/auth/login')) {
        errorMessage = 'Invalid email or password'
      } else if (url.includes('/auth')) {
        errorMessage = 'Authentication required'
      }
    } else if (response.status === 403) {
      errorMessage = 'Access forbidden'
    } else if (response.status === 404) {
      errorMessage = 'Resource not found'
    }

    throw new ApiError(errorMessage, response.status, response)
  }

  // Deserialize JSON response (hidden from caller)
  // Type assertion is safe here because T extends ApiResponse (validated response type)

  return (await response.json()) as T
}

/**
 * Helper function to create API request objects with explicit URL
 * @param url - The endpoint URL (e.g., '/homepage')
 * @param data - Request data without the URL property
 * @returns Complete request object with URL
 */
export function createApiRequest<T extends ApiRequest>(url: string, data: Omit<T, 'url'>): T {
  // Type assertion is safe - we're adding the required 'url' property to create a complete T

  return { ...data, url } as T
}

/**
 * Export ApiError for use in feature modules
 */
export { ApiError }
