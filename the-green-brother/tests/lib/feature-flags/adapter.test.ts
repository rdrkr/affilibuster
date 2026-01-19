// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Feature Flags Adapter Tests
 *
 * Note: The flags SDK Adapter type doesn't fully resolve in ESLint's strict mode,
 * but works correctly at runtime. Tests use manual type annotations to silence
 * false positive type errors.
 */
import { cmsAdapter } from '@/lib/feature-flags/adapter'
import type { FeatureFlag, FeatureFlagsResponse } from '@/lib/feature-flags/api'
import * as featureFlagsApi from '@/lib/feature-flags/api'

// Mock React cache to be an identity function (no caching in tests)
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  // Mock cache as identity function using generics to preserve types

  cache: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn,
}))

// Mock the API module
jest.mock('@/lib/feature-flags/api', () => ({
  getFeatureFlags: jest.fn(),
}))

const mockGetFeatureFlags = featureFlagsApi.getFeatureFlags as jest.MockedFunction<
  typeof featureFlagsApi.getFeatureFlags
>

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

/** Type for the adapter's decide function */
type DecideFunction = (params: { key: string }) => Promise<boolean>

describe('Feature Flags Adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('cmsAdapter', () => {
    it('should return true for enabled flag', async () => {
      const mockResponse: FeatureFlagsResponse = {
        data: [createMockFlag({ key: 'test-flag', developmentEnabled: true })],
        meta: {},
      }
      mockGetFeatureFlags.mockResolvedValueOnce(mockResponse)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'test-flag' })

      expect(result).toBe(true)
      expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1)
    })

    it('should return false for disabled flag', async () => {
      const mockResponse: FeatureFlagsResponse = {
        data: [createMockFlag({ key: 'test-flag', developmentEnabled: false })],
        meta: {},
      }
      mockGetFeatureFlags.mockResolvedValueOnce(mockResponse)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'test-flag' })

      expect(result).toBe(false)
    })

    it('should return false for flag with null enabled', async () => {
      const mockResponse: FeatureFlagsResponse = {
        data: [createMockFlag({ key: 'test-flag', developmentEnabled: null })],
        meta: {},
      }
      mockGetFeatureFlags.mockResolvedValueOnce(mockResponse)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'test-flag' })

      expect(result).toBe(false)
    })

    it('should return false for non-existent flag', async () => {
      const mockResponse: FeatureFlagsResponse = {
        data: [createMockFlag({ key: 'other-flag', developmentEnabled: true })],
        meta: {},
      }
      mockGetFeatureFlags.mockResolvedValueOnce(mockResponse)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'non-existent' })

      expect(result).toBe(false)
    })

    it('should return false when API returns null', async () => {
      mockGetFeatureFlags.mockResolvedValueOnce(null)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'test-flag' })

      expect(result).toBe(false)
    })

    it('should return false when API response has no data', async () => {
      mockGetFeatureFlags.mockResolvedValueOnce({
        data: undefined,
        meta: {},
      } as unknown as FeatureFlagsResponse)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'test-flag' })

      expect(result).toBe(false)
      expect(mockGetFeatureFlags).toHaveBeenCalledTimes(1)
    })

    it('should handle flags with empty key', async () => {
      const mockResponse: FeatureFlagsResponse = {
        data: [
          createMockFlag({ id: 1, documentId: 'doc1', key: '', developmentEnabled: true }),
          createMockFlag({ id: 2, documentId: 'doc2', key: 'valid-flag', developmentEnabled: true }),
        ],
        meta: {},
      }
      mockGetFeatureFlags.mockResolvedValueOnce(mockResponse)

      const adapter = cmsAdapter()
      const decide = adapter.decide as DecideFunction
      const result = await decide({ key: 'valid-flag' })

      expect(result).toBe(true)
    })
  })
})
