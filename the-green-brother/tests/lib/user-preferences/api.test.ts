// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for user-preferences API module
 */

import { CurrencyCode } from '@/lib/generated/types.gen'
import { getUserPreferences, updateUserPreferences } from '@/lib/user-preferences/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: unknown) => ({ url, ...(data as object) })),
}))

import { apiRequest } from '@/lib/core/client'

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('user-preferences API', () => {
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

  describe('getUserPreferences', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockPreferences = { selectedCurrency: CurrencyCode.USD }
      mockApiRequest.mockResolvedValueOnce(mockPreferences as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getUserPreferences('session-123')

      expect(result).toEqual(mockPreferences)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/user/preferences',
          headers: { 'X-Session-Id': 'session-123' },
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Network error')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getUserPreferences('session-123')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to get user preferences:', error)
    })
  })

  describe('updateUserPreferences', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { success: true }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const body = { selectedCurrency: CurrencyCode.EUR }
      const result = await updateUserPreferences('session-456', body)

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/user/preferences',
          body,
          headers: { 'X-Session-Id': 'session-456' },
        }),
        { method: 'PUT' }
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Update failed')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await updateUserPreferences('session-456', { selectedCurrency: CurrencyCode.EUR })

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to update user preferences:', error)
    })
  })
})
