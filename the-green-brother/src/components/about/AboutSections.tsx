// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * About Sections Component
 *
 * Dynamic zone renderer for about page sections.
 * Routes each section to its appropriate component based on __component discriminator.
 * Supports horizontal layout markers for grouping sections in rows.
 */

import type { ReactNode } from 'react'

import { TextBlock } from '@/components/elements'
import { DynamicZone } from '@/components/layout'
import { BrandFeaturesSection, HeroSection, TeamSection } from '@/components/sections'
import type { ApiAboutAboutDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Union type for all about section types with discriminators
 */
type AboutSection = ApiAboutAboutDocument['sections'][number]

/**
 * Props for the AboutSections component
 */
export interface AboutSectionsProps {
  /** About page sections array from CMS */
  sections: AboutSection[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Renders about page sections based on their component type.
 * Uses DynamicZone to support horizontal layout markers.
 * @param props - Component props with sections
 * @param props.sections - About page sections array from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Rendered about page sections with layout support
 */
export function AboutSections({ sections, direction }: AboutSectionsProps) {
  /**
   * Render a single section based on its component type
   * @param section - Section with __component discriminator
   * @returns JSX element for the section or null
   */
  const renderSection = (section: AboutSection): ReactNode => {
    switch (section.__component) {
      case 'sections.hero':
        return <HeroSection key={section.id} data={section} direction={direction} />

      case 'sections.team-grid':
        return <TeamSection key={section.id} data={section} direction={direction} />

      case 'sections.brand-features-section':
        return <BrandFeaturesSection key={section.id} data={section} direction={direction} />

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
    />
  )
}

export default AboutSections
