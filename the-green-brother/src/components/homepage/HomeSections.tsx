// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Home Sections Component
 *
 * Dynamic zone renderer for homepage sections.
 * Routes each section to its appropriate component based on __component discriminator.
 * Supports horizontal layout markers for grouping sections in rows.
 */

'use client'

import type { ReactNode } from 'react'

import { NewsletterSignupCTA } from '@/components/call-to-actions'
import { TextBlock } from '@/components/elements'
import { DynamicZone } from '@/components/layout'
import { useLayoutContext } from '@/components/providers/LayoutProvider'
import {
  BlogTeaserSection,
  BrandFeaturesSection,
  FeaturedProductsSection,
  HeroSection,
  ProductCategoriesSection,
  TeamSection,
} from '@/components/sections'
import type {
  ApiBlogPostBlogPostDocument,
  ApiContributorContributorDocument,
  ApiHomepageHomepageDocument,
  ApiProductCategoryProductCategoryDocument,
  ApiProductProductDocument,
  ElementsLabelEntry,
} from '@/lib/generated/types.gen'

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
  /** Contributors for team section */
  contributors: ApiContributorContributorDocument[]
  /** Feature flag: Enable user profile features (login/signup, favorites) */
  enableUserProfile?: boolean
  /** Read time label */
  readTimeMinutesLabel: ElementsLabelEntry
  /** Read article label */
  readArticleLabel: ElementsLabelEntry
  /** Default contributor */
  defaultContributor: ApiContributorContributorDocument
}

/**
 * Renders homepage sections based on their component type.
 * Uses DynamicZone to support horizontal layout markers.
 * @param props - Component props with sections and related data
 * @returns Rendered homepage sections with layout support
 */
export function HomeSections(props: HomeSectionsProps) {
  const {
    sections,
    products,
    categories,
    blogPosts,
    contributors,
    enableUserProfile = false,
    readTimeMinutesLabel,
    readArticleLabel,
    defaultContributor,
  } = props
  const { direction } = useLayoutContext()

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
        return (
          <FeaturedProductsSection
            key={section.id}
            data={section}
            products={products}
            direction={direction}
            enableUserProfile={enableUserProfile}
          />
        )

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
        return (
          <BlogTeaserSection
            key={section.id}
            data={section}
            blogPosts={blogPosts}
            direction={direction}
            readTimeMinutesLabel={readTimeMinutesLabel}
            readArticleLabel={readArticleLabel}
            defaultContributor={defaultContributor}
          />
        )

      case 'sections.team-grid':
        return <TeamSection key={section.id} data={section} contributors={contributors} direction={direction} />

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
    <DynamicZone sections={sections} renderSection={renderSection} direction={direction} verticalAlignment="center" />
  )
}

export default HomeSections
