// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency API Tests
 */
import * as apiClient from '@/lib/core/client'
import { getCurrencies, getCurrencyById } from '@/lib/currencies/api'

// Mock the apiRequest and createApiRequest functions
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, options?: Record<string, unknown>) => ({ url, ...options })),
}))

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<typeof apiClient.apiRequest>
const mockCreateApiRequest = apiClient.createApiRequest as jest.MockedFunction<typeof apiClient.createApiRequest>

describe('Currency API', () => {
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

  describe('getCurrencies', () => {
    it('should fetch currencies', async () => {
      const mockData = { data: [{ id: 1, code: 'USD' }], meta: {} }
      mockApiRequest.mockResolvedValueOnce(mockData as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getCurrencies()

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/currencies', {
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getCurrencies()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch currencies:', error)
    })
  })

  describe('getCurrencyById', () => {
    it('should fetch single currency by ID', async () => {
      const mockData = { id: 1, code: 'USD', name: 'US Dollar' }
      mockApiRequest.mockResolvedValueOnce({ data: mockData } as unknown as ReturnType<typeof apiClient.apiRequest>)

      const result = await getCurrencyById('123')

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/currencies/123', {
        path: { id: '123' },
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getCurrencyById('456')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch currency 456:', error)
    })
  })
})
