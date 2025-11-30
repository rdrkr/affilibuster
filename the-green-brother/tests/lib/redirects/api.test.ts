// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for redirects API module
 */

import { apiRequest } from '@/lib/core/client'
import { checkRedirect } from '@/lib/redirects/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('redirects API', () => {
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

  describe('checkRedirect', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { redirect: true, target: '/new-url' }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const query = { source_url: '/old-url' }
      const result = await checkRedirect(query)

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/redirects/check',
          query,
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Redirect check failed')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await checkRedirect({ source_url: '/test' })

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to check redirect:', error)
    })
  })
})
