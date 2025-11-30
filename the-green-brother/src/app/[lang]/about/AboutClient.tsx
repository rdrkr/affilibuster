// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * About Client Component
 *
 * Renders the about page using CMS data through composable section components.
 * Handles client-side animations while all content comes from CMS.
 */

'use client'

import { useEffect, useState } from 'react'

import { AboutSections } from '@/components/about'
import type { ApiAboutAboutDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Props for the AboutClient component
 */
export interface AboutClientProps {
  /** About page CMS data (null if unavailable) */
  aboutData: ApiAboutAboutDocument | null
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * About page client component that renders CMS-driven sections with animations.
 * @param props - About page data from server component
 * @param props.aboutData - About page CMS data (null if unavailable)
 * @param props.direction - Language direction for RTL support
 * @returns Rendered about page or null if no CMS data
 */
export default function AboutClient({ aboutData, direction }: AboutClientProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to avoid cascading renders
    const frame = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [])

  // Don't render if no about data from CMS
  if (!aboutData) {
    return null
  }

  return (
    <div
      className={`
        space-y-16 py-8 transition-opacity duration-1000
        md:space-y-24
        ${isVisible ? `opacity-100` : `opacity-0`}
      `}
    >
      <AboutSections sections={aboutData.sections} direction={direction} />
    </div>
  )
}
