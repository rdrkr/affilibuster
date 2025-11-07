// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Mock API Response Builder Utilities
 *
 * Helpers to create typed fetch responses matching OpenAPI spec
 * Useful for integration tests that mock fetch() calls
 *
 * Usage:
 *   import { mockApiSuccess, mockApiError } from '../utils/mock-api'
 *
 *   global.fetch = jest.fn().mockResolvedValue(
 *     mockApiSuccess({ data: products })
 *   )
 */

/**
 * Create a successful API response with typed data
 * @template T - The type of the response data
 * @param data - The response data
 * @param status - HTTP status code (default: 200)
 * @returns A mock Response object
 *
 * @example
 * ```typescript
 * const response = mockApiSuccess({ data: currencies }, 200)
 * expect(response.ok).toBe(true)
 * expect(await response.json()).toEqual({ data: currencies })
 * ```
 */
export function mockApiSuccess(data: unknown, status = 200): Response {
  return {
    ok: true,
    status,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    json: async () => Promise.resolve(data),
    text: async () => Promise.resolve(JSON.stringify(data)),
    blob: async () => Promise.resolve(new Blob([JSON.stringify(data)])),
    arrayBuffer: async () => Promise.resolve(new ArrayBuffer(0)),
    formData: async () => Promise.resolve(new FormData()),
    clone: () => mockApiSuccess(data, status),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic',
    url: '',
  } as Response
}

/**
 * Create an error API response
 * @param status - HTTP error status code
 * @param message - Error message
 * @param code - Error code (optional)
 * @returns A mock Response object representing an error
 *
 * @example
 * ```typescript
 * const response = mockApiError(404, 'Not Found', 'NOT_FOUND')
 * expect(response.ok).toBe(false)
 * expect(response.status).toBe(404)
 * ```
 */
export function mockApiError(status: number, message: string, code?: string): Response {
  const errorData = {
    error: 'Error',
    message,
    code: code ?? `ERROR_${status.toString()}`,
    timestamp: new Date().toISOString(),
  }

  return {
    ok: false,
    status,
    statusText: message,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    json: async () => Promise.resolve(errorData),
    text: async () => Promise.resolve(JSON.stringify(errorData)),
    blob: async () => Promise.resolve(new Blob([JSON.stringify(errorData)])),
    arrayBuffer: async () => Promise.resolve(new ArrayBuffer(0)),
    formData: async () => Promise.resolve(new FormData()),
    clone: () => mockApiError(status, message, code),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic',
    url: '',
  } as Response
}

/**
 * Create a mock fetch function that returns the specified response
 * @param data - The response data
 * @param status - HTTP status code (default: 200)
 * @returns A jest mock function
 *
 * @example
 * ```typescript
 * global.fetch = mockFetchSuccess({ data: products })
 * const result = await fetch('/api/products')
 * expect(await result.json()).toEqual({ data: products })
 * ```
 */
export function mockFetchSuccess(data: unknown, status = 200) {
  return jest.fn().mockResolvedValue(mockApiSuccess(data, status))
}

/**
 * Create a mock fetch function that returns an error
 * @param status - HTTP error status code
 * @param message - Error message
 * @param code - Error code (optional)
 * @returns A jest mock function
 *
 * @example
 * ```typescript
 * global.fetch = mockFetchError(404, 'Not Found')
 * const result = await fetch('/api/missing')
 * expect(result.ok).toBe(false)
 * ```
 */
export function mockFetchError(status: number, message: string, code?: string) {
  return jest.fn().mockResolvedValue(mockApiError(status, message, code))
}

/**
 * Create a mock fetch function that rejects with an error
 * Useful for testing network errors
 * @param error - The error to reject with
 * @returns A jest mock function
 *
 * @example
 * ```typescript
 * global.fetch = mockFetchNetworkError(new Error('Network failed'))
 * await expect(fetch('/api/data')).rejects.toThrow('Network failed')
 * ```
 */
export function mockFetchNetworkError(error: Error) {
  return jest.fn().mockRejectedValue(error)
}
