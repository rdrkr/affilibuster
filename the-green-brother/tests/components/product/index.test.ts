// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/product barrel exports
 */

import * as product from '@/components/product'

describe('components/product barrel exports', () => {
  it('should export ProductCard component', () => {
    expect(product.ProductCard).toBeDefined()
  })

  it('should export ProductsGrid component', () => {
    expect(product.ProductsGrid).toBeDefined()
  })

  it('should export QuantitySelector component', () => {
    expect(product.QuantitySelector).toBeDefined()
  })
})
