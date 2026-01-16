// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Feature Flags API Tests
 */
import * as apiClient from '@/lib/core/client'
import { getFeatureFlags, type FeatureFlag, type FeatureFlagsResponse } from '@/lib/feature-flags/api'

// Mock the apiRequest and createApiRequest functions
jest.mock('@/lib/core/client', () => ({
  apiRequest: jest.fn(),
  createApiRequest: jest.fn((url: string, options?: Record<string, unknown>) => ({ url, ...options })),
}))

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<typeof apiClient.apiRequest>
const mockCreateApiRequest = apiClient.createApiRequest as jest.MockedFunction<typeof apiClient.createApiRequest>

/**
 * Helper to create a mock feature flag.
 * @param overrides - Partial flag data to override defaults
 * @returns A complete FeatureFlag object
 */
function createMockFlag(overrides: Partial<FeatureFlag>): FeatureFlag {
  return {
    id: 1,
    documentId: 'doc1',
    key: 'test-flag',
    name: 'Test Flag',
    developmentEnabled: false,
    productionEnabled: false,
    publishedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('Feature Flags API', () => {
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

  describe('getFeatureFlags', () => {
    it('should fetch feature flags', async () => {
      const mockData: FeatureFlagsResponse = {
        data: [
          createMockFlag({ key: 'test-flag', developmentEnabled: true }),
          createMockFlag({ id: 2, documentId: 'doc2', key: 'another-flag', developmentEnabled: false }),
        ],
        meta: {},
      }
      mockApiRequest.mockResolvedValueOnce(mockData)

      const result = await getFeatureFlags()

      expect(mockCreateApiRequest).toHaveBeenCalledWith('/feature-flags', {
        query: { customPopulate: 'nested' },
      })
      expect(result).toEqual(mockData)
    })

    it('should return null and log error on failure', async () => {
      const error = new Error('Failed to fetch')
      mockApiRequest.mockRejectedValueOnce(error)

      const result = await getFeatureFlags()

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch feature flags:', error)
    })
  })
})
