// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Health API Module
 *
 * Provides health check functionality for the backend API.
 * All functions use the strongly-typed apiRequest() from the core client module.
 *
 * Health checks are useful for monitoring, load balancers, and service readiness.
 */

import { apiRequest, createApiRequest } from '@/lib/core/client'

import type { HealthCheckData, HealthCheckResponses } from '@/lib/generated/types.gen'

/**
 * Check the health status of the backend API
 * @returns The health status response or null if the request fails
 */
export async function checkHealth(): Promise<HealthCheckResponses[200] | null> {
  try {
    const request = createApiRequest<HealthCheckData>('/health', {})
    return await apiRequest<HealthCheckResponses[200]>(request)
  } catch (error) {
    console.error('Failed to check health:', error)
    return null
  }
}
