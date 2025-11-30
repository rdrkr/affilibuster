// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Languages API Tests
 */

import { apiRequest } from '@/lib/core/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { detectLanguage, getLanguages } from '@/lib/languages/api'

// Mock the apiRequest and createApiRequest functions
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('languages API', () => {
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

  describe('getLanguages', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = [
        { code: CodeEnum.EN, name: 'English', flag: '🇺🇸' },
        { code: CodeEnum.IT, name: 'Italiano', flag: '🇮🇹' },
      ]
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getLanguages()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/languages' }))
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getLanguages()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch Languages:', error)
    })
  })

  describe('detectLanguage', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { detectedLanguage: CodeEnum.EN, shouldPrompt: false }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const body = { acceptLanguage: 'en-US,en;q=0.9' }
      const result = await detectLanguage(body)

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/languages/detect',
          body,
        }),
        { method: 'POST' }
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Detection failed')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await detectLanguage({ acceptLanguage: CodeEnum.EN })

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to detect language:', error)
    })
  })
})
