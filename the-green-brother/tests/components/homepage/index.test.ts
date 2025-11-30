// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for components/homepage barrel exports
 */

import * as homepage from '@/components/homepage'

describe('components/homepage barrel exports', () => {
  it('should export HomeSections component', () => {
    expect(homepage.HomeSections).toBeDefined()
  })

  it('should export section components', () => {
    expect(homepage.BlogTeaserSection).toBeDefined()
    expect(homepage.BrandFeaturesSection).toBeDefined()
    expect(homepage.FeaturedProductsSection).toBeDefined()
    expect(homepage.HeroSection).toBeDefined()
    expect(homepage.ProductCategoriesSection).toBeDefined()
  })

  it('should export call-to-action components', () => {
    expect(homepage.NewsletterSignupCTA).toBeDefined()
  })
})
