// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/blog-post-tags barrel exports
 */

import * as blogPostTags from '@/lib/blog-post-tags'

describe('lib/blog-post-tags barrel exports', () => {
  it('should export getBlogPostTags function', () => {
    expect(blogPostTags.getBlogPostTags).toBeDefined()
    expect(typeof blogPostTags.getBlogPostTags).toBe('function')
  })

  it('should export getBlogPostTagById function', () => {
    expect(blogPostTags.getBlogPostTagById).toBeDefined()
    expect(typeof blogPostTags.getBlogPostTagById).toBe('function')
  })
})
