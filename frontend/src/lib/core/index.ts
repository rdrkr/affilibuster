// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Core API client infrastructure exports.
 *
 * @packageDocumentation
 */
export { ApiError, type BaseApiRequest } from './api-types'
export {
  apiRequest,
  createApiRequest,
  getBaseUrl,
  getSessionId,
  type ApiRequestAdditionalOptions,
  type NextRequestConfig,
} from './client'
