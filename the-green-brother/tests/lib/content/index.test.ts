// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/content barrel exports
 */

import * as content from '@/lib/content'

describe('lib/content barrel exports', () => {
  it('should export getHomepage function', () => {
    expect(content.getHomepage).toBeDefined()
    expect(typeof content.getHomepage).toBe('function')
  })

  it('should export getProducts function', () => {
    expect(content.getProducts).toBeDefined()
    expect(typeof content.getProducts).toBe('function')
  })

  it('should export getProductById function', () => {
    expect(content.getProductBySlug).toBeDefined()
    expect(typeof content.getProductBySlug).toBe('function')
  })

  it('should export getAbout function', () => {
    expect(content.getAbout).toBeDefined()
    expect(typeof content.getAbout).toBe('function')
  })

  it('should export getBlogPosts function', () => {
    expect(content.getBlogPosts).toBeDefined()
    expect(typeof content.getBlogPosts).toBe('function')
  })
})
