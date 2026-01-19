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

import { ButtonLink, Header, Image } from '@/components/elements'
import { AlignmentEnum, DirectionEnum, VariantEnum, type SectionsHeroEntry } from '@/lib/generated/types.gen'

/**
 * Props for the HeroSection component
 */
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
  /** Layout variant override */
  variant?: VariantEnum
  /** Header slot - renders above the content (e.g., tags) */
  header?: React.ReactNode
  /** Content slot - main content area (e.g., title, subtitle) */
  content?: React.ReactNode
  /** Footer slot - bottom section (e.g., author, date) */
  footer?: React.ReactNode
}

/**
 * Hero section with background image and call-to-action.
 * @param props - Component props with CMS hero data
 * @param props.data - Hero section data from CMS
 * @param props.direction - Language direction for RTL support
 * @param props.variant - Layout variant override
 * @param props.header - Header slot content
 * @param props.content - Main content slot
 * @param props.footer - Footer slot content
 * @returns Hero section component
 */
export function HeroSection({
  data,
  direction,
  variant: variantProp,
  header: headerSlot,
  content: contentSlot,
  footer: footerSlot,
}: HeroSectionProps) {
  // Use props or fall back to data
  const { image } = data
  const variant = variantProp ?? data.variant
  const alignment = data.header.alignment

  // --- Shared Logic ---

  // Determine if content should be right-aligned (RTL) or left-aligned (LTR)
  // or centered if explicitly set in CMS
  const isRTL = direction === DirectionEnum.RTL
  const isCentered = alignment === AlignmentEnum.CENTER

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
      {/* Manual Slots */}
      {headerSlot}
      {contentSlot}
      {!contentSlot && <Header data={data.header} level={1} direction={direction} />}

      {footerSlot && <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">{footerSlot}</div>}

      {!footerSlot && data.exploreButton && (
        <ButtonLink
          data={data.exploreButton}
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
      <Image
        image={image}
        className={`size-full object-cover ${isOverlay ? 'opacity-80' : 'rounded-xl'}`}
        fill
        preload
        loading="eager"
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
        aria-label={data.header.header?.ariaDescription ?? ''}
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
        aria-label={data.header.header?.ariaDescription ?? ''}
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
      aria-label={data.header.header?.ariaDescription ?? ''}
    >
      <div className="w-full overflow-hidden rounded-xl shadow-2xl">{renderImage(false)}</div>
      <div className={`w-full ${justifyClass} flex`}>{renderContent(false)}</div>
    </section>
  )
}

export default HeroSection
