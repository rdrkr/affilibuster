// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog-post-tags API module
 */

import { getBlogPostTagById, getBlogPostTags } from '@/lib/blog-post-tags/api'
import { CodeEnum } from '@/lib/generated/types.gen'

// Mock the core client module
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, data: Record<string, unknown>) => ({ url, ...data })),
}))

import { apiRequest } from '@/lib/core/client'

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>

describe('blog-post-tags API', () => {
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

  describe('getBlogPostTags', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: [{ id: '1', name: 'Tag 1' }] }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getBlogPostTags()

      expect(result).toEqual(mockResponse)
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/blog-post-tags',
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: [] }
      mockApiRequest.mockResolvedValueOnce(mockResponse)

      await getBlogPostTags({ locale: CodeEnum.EN })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: CodeEnum.EN, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getBlogPostTags()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch blog post tags:', error)
    })
  })

  describe('getBlogPostTagById', () => {
    it('should call apiRequest with correct parameters', async () => {
      const mockResponse = { data: { id: '1', name: 'Tag 1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      const result = await getBlogPostTagById('tag-123')

      expect(result).toEqual({ id: '1', name: 'Tag 1' })
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/blog-post-tags/tag-123',
          path: { id: 'tag-123' },
          query: expect.objectContaining({ customPopulate: 'nested' }),
        })
      )
    })

    it('should pass query parameters with customPopulate', async () => {
      const mockResponse = { data: { id: '1' } }
      mockApiRequest.mockResolvedValueOnce(mockResponse as unknown as Awaited<ReturnType<typeof apiRequest>>)

      await getBlogPostTagById('tag-123', { locale: CodeEnum.IT })

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ locale: CodeEnum.IT, customPopulate: 'nested' }),
        })
      )
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getBlogPostTagById('tag-456')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch blog post tag tag-456:', error)
    })
  })
})
