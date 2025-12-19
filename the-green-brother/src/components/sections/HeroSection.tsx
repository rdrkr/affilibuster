// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Hero Section Component
 *
 * Renders the hero banner section with background image, header, subheader, and CTA button.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header and ButtonLink composites for content.
 *
 * Supports three layout variants:
 * - TEXT_OVER_BACKGROUND: Header centered over image (image as background)
 * - TEXT_ABOVE_BACKGROUND: Header above image (stacked vertically)
 * - TEXT_BELOW_BACKGROUND: Header below image (stacked vertically)
 */

import { ButtonLink, CMSImage, Header } from '@/components/elements'
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

  // --- Shared Logic ---

  // Determine if content should be right-aligned (RTL) or left-aligned (LTR)
  // or centered if explicitly set in CMS
  const isRTL = direction === DirectionEnum.RTL
  const isCentered = header.alignment === AlignmentEnum.CENTER

  // Calculate justify class for the container
  const justifyClass = isCentered ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'

  // Calculate text alignment and flex item alignment for content
  const textAlignClass = isCentered
    ? 'text-center items-center'
    : isRTL
      ? 'text-right items-end'
      : 'text-left items-start'

  // --- Render Helpers ---

  const renderContent = (isOverlay: boolean) => (
    <div
      className={`
        animate-fade-in-up relative z-20 flex max-w-4xl flex-col px-4
        text-neutral-800 dark:text-white
        ${textAlignClass}
        ${isOverlay && !isCentered ? (isRTL ? 'mr-8' : 'ml-8') : ''}
      `}
    >
      <Header
        data={header}
        headerClassName="text-5xl sm:text-7xl md:text-7xl leading-tight tracking-tight"
        subheaderClassName="mt-8 text-lg sm:text-xl md:text-xl text-neutral-600 dark:text-white"
        direction={direction}
      />
      {exploreButton && (
        <ButtonLink
          data={exploreButton}
          direction={direction}
          variant="primary"
          size="lg"
          className={`
            mt-10
            shadow-lg shadow-primary/20
            hover:scale-105
          `}
        />
      )}
    </div>
  )

  const renderImage = (isOverlay: boolean) => (
    <div className={isOverlay ? 'absolute inset-0 z-0' : 'relative h-[40vh] max-h-100 min-h-62.5 w-full'}>
      <CMSImage
        image={image}
        className={`size-full object-cover ${isOverlay ? 'opacity-80' : 'rounded-xl'}`}
        fill
        preload
        sizes="100vw"
      />
    </div>
  )

  // --- Layout Variants ---

  // TEXT_OVER_BACKGROUND: Header centered over image (image as background)
  if (variant === VariantEnum.TEXT_OVER_BACKGROUND) {
    return (
      <section
        className={`
          relative flex h-[60vh] max-h-150 min-h-100 items-center overflow-hidden
          rounded-xl shadow-2xl ${justifyClass}
        `}
        aria-label={header.header?.ariaDescription ?? ''}
      >
        {renderImage(true)}
        {/* Dark overlay gradient for readability */}
        <div
          className={`
            absolute inset-0 z-10 bg-linear-to-t from-white/90
            via-white/40 to-transparent
            dark:from-background-dark/90 dark:via-background-dark/40
          `}
        />
        {renderContent(true)}
      </section>
    )
  }

  // TEXT_ABOVE_BACKGROUND: Header above image (stacked vertically)
  if (variant === VariantEnum.TEXT_ABOVE_BACKGROUND) {
    return (
      <section
        className={`flex flex-col gap-8 ${isCentered ? 'items-center' : isRTL ? 'items-end' : 'items-start'}`}
        aria-label={header.header?.ariaDescription ?? ''}
      >
        <div className={`w-full ${justifyClass} flex`}>{renderContent(false)}</div>
        <div className="w-full overflow-hidden rounded-xl shadow-2xl">{renderImage(false)}</div>
      </section>
    )
  }

  // TEXT_BELOW_BACKGROUND: Header below image (stacked vertically) - default case
  return (
    <section
      className={`flex flex-col gap-8 ${isCentered ? 'items-center' : isRTL ? 'items-end' : 'items-start'}`}
      aria-label={header.header?.ariaDescription ?? ''}
    >
      <div className="w-full overflow-hidden rounded-xl shadow-2xl">{renderImage(false)}</div>
      <div className={`w-full ${justifyClass} flex`}>{renderContent(false)}</div>
    </section>
  )
}

export default HeroSection
