// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Feature Flags Index Tests
 *
 * Tests for the barrel export module.
 */
import * as featureFlags from '@/lib/feature-flags'

// Mock flags/next to avoid ESM issues with jose dependency
jest.mock('flags/next', () => ({
  flag: jest.fn(config => {
    const mockFlag = () => Promise.resolve(config.defaultValue)
    Object.assign(mockFlag, config)
    return mockFlag
  }),
}))

describe('Feature Flags Index', () => {
  it('should export getFeatureFlags', () => {
    expect(featureFlags.getFeatureFlags).toBeDefined()
    expect(typeof featureFlags.getFeatureFlags).toBe('function')
  })

  it('should export cmsAdapter', () => {
    expect(featureFlags.cmsAdapter).toBeDefined()
    expect(typeof featureFlags.cmsAdapter).toBe('function')
  })

  it('should export productSearchFlag', () => {
    expect(featureFlags.productSearchFlag).toBeDefined()
    expect(typeof featureFlags.productSearchFlag).toBe('function')
  })
})
