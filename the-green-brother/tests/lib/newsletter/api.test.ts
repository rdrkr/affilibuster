// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for newsletter API module.
 *
 * Verifies newsletter subscription and unsubscription functionality
 * with proper error handling.
 */

import * as apiClient from '@/lib/core/client'
import { subscribeNewsletter, unsubscribeNewsletter } from '@/lib/newsletter/api'

jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, options?: Record<string, unknown>) => ({ url, ...options })),
}))

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<typeof apiClient.apiRequest>
const mockCreateApiRequest = apiClient.createApiRequest as jest.MockedFunction<typeof apiClient.createApiRequest>

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('subscribeNewsletter', () => {
  it('should post subscription via apiRequest', async () => {
    const responseBody = { success: true }
    mockApiRequest.mockResolvedValueOnce(responseBody as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    const result = await subscribeNewsletter('user@example.com')

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/newsletter/subscribe', {
      body: { email: 'user@example.com' },
    })
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/newsletter/subscribe', body: { email: 'user@example.com' } }),
      { method: 'POST' }
    )
    expect(result).toEqual(responseBody)
  })

  it('should return null and log error on API failure', async () => {
    const error = new Error('API request failed: Bad Gateway')
    mockApiRequest.mockRejectedValueOnce(error)

    const result = await subscribeNewsletter('user@example.com')

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to subscribe to newsletter:', error)
  })

  it('should return null and log error on network failure', async () => {
    const error = new Error('Network failure')
    mockApiRequest.mockRejectedValueOnce(error)

    const result = await subscribeNewsletter('bad@email.com')

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to subscribe to newsletter:', error)
  })
})

describe('unsubscribeNewsletter', () => {
  it('should post unsubscription via apiRequest', async () => {
    const responseBody = { success: true }
    mockApiRequest.mockResolvedValueOnce(responseBody as unknown as Awaited<ReturnType<typeof apiClient.apiRequest>>)

    const result = await unsubscribeNewsletter('user@example.com')

    expect(mockCreateApiRequest).toHaveBeenCalledWith('/newsletter/unsubscribe', {
      body: { email: 'user@example.com' },
    })
    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/newsletter/unsubscribe', body: { email: 'user@example.com' } }),
      { method: 'POST' }
    )
    expect(result).toEqual(responseBody)
  })

  it('should return null and log error on API failure', async () => {
    const error = new Error('API request failed: Bad Gateway')
    mockApiRequest.mockRejectedValueOnce(error)

    const result = await unsubscribeNewsletter('user@example.com')

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to unsubscribe from newsletter:', error)
  })

  it('should return null and log error on network failure', async () => {
    const error = new Error('Network failure')
    mockApiRequest.mockRejectedValueOnce(error)

    const result = await unsubscribeNewsletter('bad@email.com')

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Failed to unsubscribe from newsletter:', error)
  })
})
