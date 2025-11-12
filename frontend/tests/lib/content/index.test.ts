// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for content module barrel exports
 *
 * These tests verify that the content module properly exports
 * all its public APIs through the index file.
 */

import * as ContentModule from '@/lib/content'

describe('Content Module Exports', () => {
  it('should export getHomepage function', () => {
    expect(ContentModule.getHomepage).toBeDefined()
    expect(typeof ContentModule.getHomepage).toBe('function')
  })

  it('should export getAbout function', () => {
    expect(ContentModule.getAbout).toBeDefined()
    expect(typeof ContentModule.getAbout).toBe('function')
  })

  it('should export getContact function', () => {
    expect(ContentModule.getContact).toBeDefined()
    expect(typeof ContentModule.getContact).toBe('function')
  })

  it('should export getProductPage function', () => {
    expect(ContentModule.getProductPage).toBeDefined()
    expect(typeof ContentModule.getProductPage).toBe('function')
  })

  it('should export getNavigation function', () => {
    expect(ContentModule.getNavigation).toBeDefined()
    expect(typeof ContentModule.getNavigation).toBe('function')
  })

  it('should export getFooter function', () => {
    expect(ContentModule.getFooter).toBeDefined()
    expect(typeof ContentModule.getFooter).toBe('function')
  })

  it('should export getPrivacy function', () => {
    expect(ContentModule.getPrivacy).toBeDefined()
    expect(typeof ContentModule.getPrivacy).toBe('function')
  })

  it('should export getError404 function', () => {
    expect(ContentModule.getError404).toBeDefined()
    expect(typeof ContentModule.getError404).toBe('function')
  })

  it('should export getError410 function', () => {
    expect(ContentModule.getError410).toBeDefined()
    expect(typeof ContentModule.getError410).toBe('function')
  })

  it('should export getTerm function', () => {
    expect(ContentModule.getTerm).toBeDefined()
    expect(typeof ContentModule.getTerm).toBe('function')
  })

  it('should export getProducts function', () => {
    expect(ContentModule.getProducts).toBeDefined()
    expect(typeof ContentModule.getProducts).toBe('function')
  })
})
