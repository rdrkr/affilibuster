// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/product-tags barrel exports
 */

import * as productTags from '@/lib/product-tags'

describe('lib/product-tags barrel exports', () => {
  it('should export getProductTags function', () => {
    expect(productTags.getProductTags).toBeDefined()
    expect(typeof productTags.getProductTags).toBe('function')
  })

  it('should export getProductTagById function', () => {
    expect(productTags.getProductTagById).toBeDefined()
    expect(typeof productTags.getProductTagById).toBe('function')
  })
})
