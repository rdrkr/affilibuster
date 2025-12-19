// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Home Sections Component
 *
 * Dynamic zone renderer for homepage sections.
 * Routes each section to its appropriate component based on __component discriminator.
 * Supports horizontal layout markers for grouping sections in rows.
 */

import type { ReactNode } from 'react'

import { NewsletterSignupCTA } from '@/components/call-to-actions'
import { TextBlock } from '@/components/elements'
import { DynamicZone } from '@/components/layout'
import {
  BlogTeaserSection,
  BrandFeaturesSection,
  FeaturedProductsSection,
  HeroSection,
  ProductCategoriesSection,
} from '@/components/sections'
import type {
  ApiBlogPostBlogPostDocument,
  ApiHomepageHomepageDocument,
  ApiProductCategoryProductCategoryDocument,
  ApiProductProductDocument,
} from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Union type for all section types with discriminators
 */
type HomepageSection = ApiHomepageHomepageDocument['sections'][number]

/**
 * Props for the HomeSections component
 */
export interface HomeSectionsProps {
  /** Homepage sections array from CMS */
  sections: HomepageSection[]
  /** Products for featured products sections */
  products: ApiProductProductDocument[]
  /** Categories for category grid sections */
  categories: ApiProductCategoryProductCategoryDocument[]
  /** Blog posts for blog teaser sections */
  blogPosts: ApiBlogPostBlogPostDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Renders homepage sections based on their component type.
 * Uses DynamicZone to support horizontal layout markers.
 * @param props - Component props with sections and related data
 * @param props.sections - Homepage sections array from CMS
 * @param props.products - Products for featured products sections
 * @param props.categories - Categories for category grid sections
 * @param props.blogPosts - Blog posts for blog teaser sections
 * @param props.direction - Language direction for RTL support
 * @returns Rendered homepage sections with layout support
 */
export function HomeSections({ sections, products, categories, blogPosts, direction }: HomeSectionsProps) {
  /**
   * Render a single section based on its component type
   * @param section - Section with __component discriminator
   * @returns JSX element for the section or null
   */
  const renderSection = (section: HomepageSection): ReactNode => {
    switch (section.__component) {
      case 'sections.hero':
        return <HeroSection key={section.id} data={section} direction={direction} />

      case 'sections.featured-products':
        return <FeaturedProductsSection key={section.id} data={section} products={products} direction={direction} />

      case 'sections.category-grid':
        // Use CMS-selected categories if available, otherwise fall back to all categories
        return (
          <ProductCategoriesSection
            key={section.id}
            data={section}
            categories={section.categories ?? categories}
            direction={direction}
          />
        )

      case 'sections.brand-features-section':
        return <BrandFeaturesSection key={section.id} data={section} direction={direction} />

      case 'sections.blog-teaser':
        return <BlogTeaserSection key={section.id} data={section} blogPosts={blogPosts} direction={direction} />

      case 'call-to-actions.newsletter-signup-cta':
        return <NewsletterSignupCTA key={section.id} data={section} direction={direction} />

      case 'elements.text-block':
        return <TextBlock key={section.id} data={section} direction={direction} />

      default:
        // Unknown section type or marker - render nothing
        return null
    }
  }

  return (
    <DynamicZone
      sections={sections}
      renderSection={renderSection}
      direction={direction}
      className="space-y-8"
      verticalAlignment="center"
      horizontalGroupSpacing="-mt-26 -mb-12"
    />
  )
}

export default HomeSections
