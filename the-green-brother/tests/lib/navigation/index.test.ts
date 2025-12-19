// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/navigation module exports
 *
 * Verifies that all public exports are correctly re-exported from the index.
 */

import * as navigationModule from '@/lib/navigation'

describe('lib/navigation module exports', () => {
  it('should export useNavigationResize hook', () => {
    expect(navigationModule.useNavigationResize).toBeDefined()
    expect(typeof navigationModule.useNavigationResize).toBe('function')
  })

  it('should export calculateVisibility function', () => {
    expect(navigationModule.calculateVisibility).toBeDefined()
    expect(typeof navigationModule.calculateVisibility).toBe('function')
  })

  it('should export all expected members', () => {
    // Verify all expected exports are present
    const expectedExports = ['useNavigationResize', 'calculateVisibility']

    expectedExports.forEach(exportName => {
      expect(navigationModule).toHaveProperty(exportName)
    })
  })
})
