// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Server Hero Section Component
 *
 * Pure server component that renders the hero section with the image in the initial HTML.
 * This enables the browser to start fetching the hero image during HTML parsing,
 * significantly improving LCP on mobile by eliminating the JS hydration delay.
 *
 * Uses Next.js Image with `priority={true}` to add `<link rel="preload" as="image">`
 * to the document head, ensuring the LCP image loads as early as possible.
 *
 * Supports the same three layout variants as the client HeroSection:
 * - TEXT_OVER_BACKGROUND: Header centered over image (image as background)
 * - TEXT_ABOVE_BACKGROUND: Header above image (stacked vertically)
 * - TEXT_BELOW_BACKGROUND: Header below image (stacked vertically)
 */

import { ButtonLink, Header, getAltText, resolveImageUrl } from '@/components/elements'
import { AlignmentEnum, DirectionEnum, VariantEnum, type SectionsHeroEntry } from '@/lib/generated/types.gen'
import NextImage from 'next/image'

/**
 * Props for the ServerHeroSection component
 */
export interface ServerHeroSectionProps {
  /** Hero section data from CMS */
  data: SectionsHeroEntry & {
    __component: 'sections.hero'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Server-rendered hero section that produces an `<img>` tag in the initial HTML.
 *
 * Unlike the client `HeroSection`, this component does not use `'use client'`,
 * `useState`, or any client-side hooks. It renders a static hero with priority
 * image loading for optimal LCP performance.
 * @param props - Component props with CMS hero data
 * @param props.data - Hero section data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns Server-rendered hero section with priority image
 */
export function ServerHeroSection({ data, direction }: ServerHeroSectionProps) {
  const { image } = data
  const variant = data.variant
  const alignment = data.header.alignment

  // --- Shared Logic ---

  const isRTL = direction === DirectionEnum.RTL
  const isCentered = alignment === AlignmentEnum.CENTER

  const justifyClass = isCentered ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'

  const textAlignClass = isCentered
    ? 'text-center items-center'
    : isRTL
      ? 'text-right items-end'
      : 'text-left items-start'

  // --- Resolve image URL and alt text ---
  const imageSrc = resolveImageUrl(image)
  const imageAlt = getAltText(image)

  // --- Render Helpers ---

  const renderContent = (isOverlay: boolean) => (
    <div
      className={`
        relative z-20 flex w-full max-w-4xl flex-col px-4
        text-foreground
        ${textAlignClass}
        ${isOverlay && !isCentered ? (isRTL ? 'mr-8' : 'ml-8') : ''}
      `}
    >
      <Header data={data.header} level={1} direction={direction} />

      {data.exploreButton && (
        <ButtonLink
          data={data.exploreButton}
          direction={direction}
          variant="primary"
          size="lg"
          className={`
            mt-10
            shadow-lg shadow-primary/20
            hover:scale-105 active:scale-95
          `}
        />
      )}
    </div>
  )

  const renderImage = (isOverlay: boolean) => (
    <div className={isOverlay ? 'absolute inset-0 z-0' : 'relative h-[40vh] max-h-100 min-h-62.5 w-full'}>
      <NextImage
        src={imageSrc}
        alt={imageAlt}
        className={`size-full object-cover ${isOverlay ? 'opacity-80' : 'rounded-xl'}`}
        fill
        fetchPriority="high"
        priority
        sizes="100vw"
      />
    </div>
  )

  // --- Layout Variants ---

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

  // TEXT_BELOW_BACKGROUND - default
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

export default ServerHeroSection
