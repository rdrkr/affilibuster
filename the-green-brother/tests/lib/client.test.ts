// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/client.ts barrel exports
 */

import * as clientExports from '@/lib/client'

describe('lib/client barrel exports', () => {
  it('should export apiRequest from core/client', () => {
    expect(clientExports.apiRequest).toBeDefined()
    expect(typeof clientExports.apiRequest).toBe('function')
  })

  it('should export createApiRequest from core/client', () => {
    expect(clientExports.createApiRequest).toBeDefined()
    expect(typeof clientExports.createApiRequest).toBe('function')
  })

  it('should export getBaseUrl from core/client', () => {
    expect(clientExports.getBaseUrl).toBeDefined()
    expect(typeof clientExports.getBaseUrl).toBe('function')
  })

  it('should export getSessionId from core/client', () => {
    expect(clientExports.getSessionId).toBeDefined()
    expect(typeof clientExports.getSessionId).toBe('function')
  })

  it('should export ApiError from core/client', () => {
    expect(clientExports.ApiError).toBeDefined()
  })

  it('should export content API functions', () => {
    // Content functions from lib/content
    expect(clientExports.getHomepage).toBeDefined()
    expect(clientExports.getProducts).toBeDefined()
    expect(clientExports.getProductById).toBeDefined()
  })
})
