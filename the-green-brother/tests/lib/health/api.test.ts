// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for health API module
 */

import { checkHealth } from '@/lib/health/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

import { apiRequest } from '@/lib/core/client'

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('health API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(
      /* no-op */ () => {
        return
      }
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('checkHealth', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { status: 'healthy' }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      const result = await checkHealth()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/health' }))
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Health check failed')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await checkHealth()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to check health:', error)
    })
  })
})
