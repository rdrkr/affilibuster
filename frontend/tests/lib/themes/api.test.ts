// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for themes API module
 */

import { apiRequest } from '@/lib/core/client'
import { LanguageCode } from '@/lib/generated/types.gen'
import { getThemeById, getThemes } from '@/lib/themes/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('themes API', () => {
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

  describe('getThemes', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: [{ id: '1', name: 'Light' }] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getThemes()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/themes',
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: [] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      await getThemes({ locale: LanguageCode.EN })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: LanguageCode.EN, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getThemes()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch themes:', error)
    })
  })

  describe('getThemeById', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: { id: '1', name: 'Light' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getThemeById('theme-123')

      expect(result).toEqual({ id: '1', name: 'Light' })
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/themes/theme-123',
          path: { id: 'theme-123' },
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: { id: '1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      await getThemeById('theme-123', { locale: LanguageCode.IT })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: LanguageCode.IT, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getThemeById('theme-456')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch theme theme-456:', error)
    })
  })
})
