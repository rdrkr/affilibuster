// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Base API Request and Response Types
 *
 * Provides the foundational interfaces for type-safe API communication.
 * Each frontend application defines its own union types (ApiRequest/ApiResponse)
 * that extend these base interfaces.
 */

/**
 * Base interface for all API request data types.
 *
 * All generated *Data types from OpenAPI conform to this shape.
 * Frontend-specific union types should use this as the constraint.
 */
export interface BaseApiRequest {
  /** The endpoint URL path (e.g., '/homepage') */
  url: string
  /** Optional query parameters */
  query?: Record<string, unknown>
  /** Optional request body */
  body?: unknown
  /** Optional request headers */
  headers?: Record<string, string>
}

/**
 * Custom error class for API request failures.
 *
 * Thrown by apiRequest when:
 * - Network request fails
 * - Response status is not ok (!response.ok)
 * - Response parsing fails
 */
export class ApiError extends Error {
  /**
   * HTTP status code (if available)
   */
  public readonly status: number | undefined

  /**
   * Original error response (if available)
   */
  public readonly response: Response | undefined

  /**
   * Creates a new API error
   * @param message - Error message
   * @param status - HTTP status code
   * @param response - Original fetch Response object
   */
  constructor(message: string, status?: number, response?: Response) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }
}
