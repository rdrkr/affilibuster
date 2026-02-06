// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Feature Flags Module Tests
 *
 * Tests for the flags.ts definitions using Vercel Flags SDK.
 */

// Mock flags/next to avoid ESM issues with jose dependency
jest.mock('flags/next', () => ({
  flag: jest.fn(config => {
    const mockFlag = () => Promise.resolve(config.defaultValue)
    Object.assign(mockFlag, config)
    return mockFlag
  }),
}))

import { productSearchFlag, userProfileFlag } from '@/lib/feature-flags/flags'

// Mock the adapter module
jest.mock('@/lib/feature-flags/adapter', () => ({
  cmsAdapter: jest.fn(() => ({
    decide: jest.fn().mockResolvedValue(false),
  })),
}))

describe('Feature Flags Definitions', () => {
  describe('productSearchFlag', () => {
    it('should be defined with correct properties', () => {
      expect(productSearchFlag).toBeDefined()
      // The flag function returns a callable that evaluates the flag
      expect(typeof productSearchFlag).toBe('function')
    })
  })

  describe('userProfileFlag', () => {
    it('should be defined with correct properties', () => {
      expect(userProfileFlag).toBeDefined()
      expect(typeof userProfileFlag).toBe('function')
    })
  })
})
