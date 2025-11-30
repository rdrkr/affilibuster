// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Hero Section Component
 *
 * Renders the hero banner section with background image, header, subheader, and CTA button.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header and Button composites for content.
 *
 * Supports three layout variants:
 * - TEXT_OVER_BACKGROUND: Header centered over image (image as background)
 * - TEXT_ABOVE_BACKGROUND: Header above image (stacked vertically)
 * - TEXT_BELOW_BACKGROUND: Header below image (stacked vertically)
 */

'use client'

import { Button, CMSImage, Header } from '@/components/elements'
import { AlignmentEnum, DirectionEnum, VariantEnum, type SectionsHeroEntry } from '@/lib/generated/types.gen'

/**
 * Props for the HeroSection component
 */
export interface HeroSectionProps {
  /** Hero section data from CMS */
  data: SectionsHeroEntry & {
    __component: 'sections.hero'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Hero section with background image and call-to-action.
 * @param props - Component props with CMS hero data
 * @param props.data - Hero section data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Hero section component
 */
export function HeroSection({ data, direction }: HeroSectionProps) {
  const { header, exploreButton, image, variant } = data

  // Render content (header + button)
  const renderContent = () => (
    <div
      className={`
        animate-fade-in-up relative z-20 max-w-4xl px-4 text-white
      `}
    >
      <Header
        data={header}
        level={2}
        headerClassName={`
          text-4xl leading-tight tracking-tight
          md:text-6xl
          lg:text-7xl
        `}
        subheaderClassName={`
          mx-auto max-w-2xl text-lg font-medium text-gray-200
          md:text-xl
        `}
        direction={direction}
      />
      {exploreButton && (
        <div className="mt-10">
          <Button
            data={exploreButton}
            direction={direction}
            variant="primary"
            size="lg"
            className={`
              transform rounded-full bg-primary px-8 py-4 text-lg font-bold
              text-background-dark shadow-lg shadow-primary/20
              hover:scale-105 hover:bg-primary-hover
            `}
          />
        </div>
      )}
    </div>
  )

  // Render image
  const renderImage = (isOverlay = false) => (
    <div className={isOverlay ? 'absolute inset-0 z-0' : 'relative w-full'}>
      <CMSImage
        image={image}
        className={`h-full w-full object-cover ${isOverlay ? 'opacity-80' : 'rounded-xl'}`}
        fill={isOverlay}
        preload
        sizes="100vw"
      />
    </div>
  )

  // TEXT_OVER_BACKGROUND: Header centered with image as background (current behavior)
  if (variant === VariantEnum.TEXT_OVER_BACKGROUND) {
    // Calculate alignment class for the container
    const alignmentClass = header.alignment === AlignmentEnum.CENTER ? 'justify-center' : 'justify-start'

    return (
      <section
        className={`
          relative flex h-[60vh] max-h-[600px] min-h-[400px] items-center
          ${alignmentClass} overflow-hidden rounded-xl shadow-2xl
        `}
        aria-label={header.header?.ariaDescription ?? ''}
      >
        {renderImage(true)}
        <div
          className={`
            absolute inset-0 z-10 bg-linear-to-t from-background-dark/90
            via-background-dark/40 to-transparent
          `}
        />
        {renderContent()}
      </section>
    )
  }

  // TEXT_ABOVE_BACKGROUND: Header above image (stacked vertically)
  if (variant === VariantEnum.TEXT_ABOVE_BACKGROUND) {
    return (
      <section className="flex flex-col gap-8" aria-label={header.header?.ariaDescription ?? ''}>
        {renderContent()}
        <div className="overflow-hidden rounded-xl shadow-2xl">
          <div className="relative h-[40vh] max-h-[400px] min-h-[250px]">
            <CMSImage image={image} className="h-full w-full object-cover" fill preload sizes="100vw" />
          </div>
        </div>
      </section>
    )
  }

  // TEXT_BELOW_BACKGROUND: Header below image (stacked vertically) - default case
  return (
    <section className="flex flex-col gap-8" aria-label={header.header?.ariaDescription ?? ''}>
      <div className="overflow-hidden rounded-xl shadow-2xl">
        <div className="relative h-[40vh] max-h-[400px] min-h-[250px]">
          <CMSImage image={image} className="h-full w-full object-cover" fill preload sizes="100vw" />
        </div>
      </div>
      {renderContent()}
    </section>
  )
}

export default HeroSection
