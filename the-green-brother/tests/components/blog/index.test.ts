// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/blog barrel exports
 */

import * as blog from '@/components/blog'

describe('components/blog barrel exports', () => {
  it('should export BlogCard component', () => {
    expect(blog.BlogCard).toBeDefined()
  })
})
