// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/sections barrel exports
 */

import * as sections from '@/components/sections'

describe('components/sections barrel exports', () => {
  it('should export BlogTeaserSection component', () => {
    expect(sections.BlogTeaserSection).toBeDefined()
  })

  it('should export BrandFeaturesSection component', () => {
    expect(sections.BrandFeaturesSection).toBeDefined()
  })

  it('should export FeaturedProductsSection component', () => {
    expect(sections.FeaturedProductsSection).toBeDefined()
  })

  it('should export HeroSection component', () => {
    expect(sections.HeroSection).toBeDefined()
  })

  it('should export ProductCategoriesSection component', () => {
    expect(sections.ProductCategoriesSection).toBeDefined()
  })

  it('should export TeamSection component', () => {
    expect(sections.TeamSection).toBeDefined()
  })
})
