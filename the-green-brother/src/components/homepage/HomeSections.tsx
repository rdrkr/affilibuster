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

import dynamic from 'next/dynamic'

import { NewsletterSignupCTA } from '@/components/call-to-actions'
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
  ApiContributorContributorDocument,
  ApiHomepageHomepageDocument,
  ElementsLabelEntry,
} from '@/lib/generated/types.gen'

/** Lazy-loaded: TextBlock uses heavy react-markdown pipeline, only needed when CMS includes text-block sections */
const TextBlock = dynamic(() => import('@/components/elements/TextBlock').then(m => ({ default: m.TextBlock })))

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
  /** Contributors for team section */
  teamMembers: ApiContributorContributorDocument[]
  /** Feature flag: Enable user profile features (login/signup, favorites) */
  enableUserProfile: boolean
  /** Read time label */
  readTimeMinutesLabel: ElementsLabelEntry
  /** Read article label */
  readArticleLabel: ElementsLabelEntry
}

/**
 * Renders homepage sections based on their component type.
 * Uses DynamicZone to support horizontal layout markers.
 * @param props - Component props with sections and related data
 * @returns Rendered homepage sections with layout support
 */
export function HomeSections(props: HomeSectionsProps) {
  const { sections, teamMembers, enableUserProfile, readTimeMinutesLabel, readArticleLabel } = props
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
            direction={direction}
            enableUserProfile={enableUserProfile}
          />
        )

      case 'sections.category-grid':
        return (
          <ProductCategoriesSection
            key={section.id}
            data={section}
            categories={section.categories}
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
            direction={direction}
            readTimeMinutesLabel={readTimeMinutesLabel}
            readArticleLabel={readArticleLabel}
          />
        )

      case 'sections.team-grid':
        return <TeamSection key={section.id} data={section} contributors={teamMembers} direction={direction} />

      case 'call-to-actions.newsletter-signup-cta':
        return <NewsletterSignupCTA key={section.id} data={section} direction={direction} />

      case 'elements.text-block':
        return <TextBlock key={section.id} headerLevel={2} data={section} direction={direction} />

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
