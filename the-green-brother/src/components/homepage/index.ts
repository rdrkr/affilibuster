// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Homepage Components Barrel Export
 *
 * Exports the home sections renderer and re-exports section components
 * from the sections directory for convenience.
 */

export { HomeSections, type HomeSectionsProps } from './HomeSections'

// Re-export section components from sections directory for backwards compatibility
export {
  BlogTeaserSection,
  BrandFeaturesSection,
  FeaturedProductsSection,
  HeroSection,
  ProductCategoriesSection,
  type BlogTeaserSectionProps,
  type BrandFeaturesSectionProps,
  type FeaturedProductsSectionProps,
  type HeroSectionProps,
  type ProductCategoriesSectionProps,
} from '@/components/sections'

// Re-export call-to-actions components
export { NewsletterSignupCTA, type NewsletterSignupCTAProps } from '@/components/call-to-actions'
