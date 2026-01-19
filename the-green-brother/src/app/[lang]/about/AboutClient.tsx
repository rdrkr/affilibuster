// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * About Client Component
 *
 * Renders the about page using CMS data through composable section components.
 * Handles client-side animations while all content comes from CMS.
 */

'use client'

import { AboutSections } from '@/components/about'
import { PageClient } from '@/components/layout'
import { useLayoutContext } from '@/components/providers'
import type { ApiAboutAboutDocument, ApiContributorContributorDocument } from '@/lib/generated/types.gen'

/**
 * Props for the AboutClient component
 */
export interface AboutClientProps {
  /** About page CMS data (null if unavailable) */
  aboutData: ApiAboutAboutDocument | null
  /** List of contributors for the team section */
  contributors: ApiContributorContributorDocument[]
}

/**
 * About page client component that renders CMS-driven sections with animations.
 * @param props - About page data from server component
 * @param props.aboutData - About page CMS data (null if unavailable)
 * @param props.contributors - List of contributors
 * @returns Rendered about page or null if no CMS data
 */
export default function AboutClient({ aboutData, contributors }: AboutClientProps) {
  const { direction } = useLayoutContext()

  // Don't render if no about data from CMS
  if (!aboutData) {
    return null
  }

  return (
    <PageClient>
      <AboutSections sections={aboutData.sections} contributors={contributors} direction={direction} />
    </PageClient>
  )
}
