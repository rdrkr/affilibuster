// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for product-tags API module
 */

import { apiRequest } from '@/lib/core/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { getProductTagById, getProductTags } from '@/lib/product-tags/api'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('product-tags API', () => {
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

  describe('getProductTags', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: [{ id: '1', name: 'Tag 1' }] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getProductTags()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/product-tags',
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: [] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const query = { locale: CodeEnum.EN }
      await getProductTags(query)

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: CodeEnum.EN, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getProductTags()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch product tags:', error)
    })
  })

  describe('getProductTagById', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: { id: '1', name: 'Tag 1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getProductTagById('tag-123')

      expect(result).toEqual({ id: '1', name: 'Tag 1' })
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/product-tags/tag-123',
          path: { id: 'tag-123' },
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: { id: '1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      await getProductTagById('tag-123', { locale: CodeEnum.IT })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: CodeEnum.IT, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getProductTagById('tag-456')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch product tag tag-456:', error)
    })
  })
})
