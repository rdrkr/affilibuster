// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Card Component
 *
 * A reusable card component for displaying content in a consistent format.
 * Uses slot-based composition with header, content, and footer areas.
 * Used by FeaturedProductsSection and BlogTeaserSection.
 */

import Link from 'next/dist/client/link'
import Image from './Image'

import { DirectionEnum, type PluginUploadFileDocument } from '@/lib/generated/types.gen'

/**
 * Card size type
 */
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Card width type
 */
export type CardSizeModifier = 'fixed' | 'full' | 'fit'

/**
 * Card layout type
 */
export type CardLayout = 'ltr' | 'rtl' | 'ttb' | 'btt'

/**
 * Card image shape type
 */
export type CardImageShape = 'rectangle' | 'circle'

/**
 * Props for the Card component
 */
export interface CardProps {
  /** Link destination URL */
  href: string
  /** Featured image URL or image object */
  image?: PluginUploadFileDocument | null | undefined
  /** Header slot - renders above the content (for tags, labels) */
  header?: React.ReactNode
  /** Content slot - main content area (titles, descriptions) */
  content?: React.ReactNode
  /** Footer slot - bottom section (metadata, CTAs) */
  footer?: React.ReactNode
  /** Content overlay for image (e.g., wishlist button) - positioned absolutely */
  imageOverlay?: React.ReactNode
  /** Image sizes attribute for optimization */
  imageSizes?: string
  /** Card size (sm, md, lg) */
  size?: CardSize
  /** Card width */
  width?: CardSizeModifier
  /** Card height */
  height?: CardSizeModifier
  /** Card layout direction */
  layout?: CardLayout
  /** Card image shape */
  imageShape?: CardImageShape
  /** Additional CSS classes for the card */
  className?: string
  /** Whether to disable hover animations (default: false) */
  noAnimation?: boolean
  /** Whether the card acts as a link (defaults to false). If true, a full-card click overlay is rendered. */
  asLink?: boolean
  /** Controls visibility of entire card - when false, card is hidden from layout */
  visible?: boolean
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Whether to preload image (for LCP optimization) */
  preload?: boolean
  /** Whether to show the card background, border, and shadow (default: true) */
  showBackground?: boolean
  /** Accessible label for the full-card overlay link (required when asLink is true) */
  linkAriaLabel?: string | undefined
}

const sizeConfig: Record<
  CardSize,
  {
    /** Image classes for horizontal layouts */
    imageHorizontal: string
    /** Image classes for vertical layouts */
    imageVertical: string
    /** Container padding classes */
    paddingClasses: string
    /** Image margin classes (ltr/rtl) */
    imageMarginHorizontal?: string
  }
> = {
  xs: {
    imageHorizontal: 'rounded-3xl h-24 w-24 shrink-0 grow-0',
    imageVertical: 'rounded-3xl h-24 w-full shrink-0 grow-0',
    paddingClasses: 'ps-3 pe-0',
    imageMarginHorizontal: 'my-3',
  },
  sm: {
    imageHorizontal: 'rounded-lg aspect-square w-[3/7] shrink-0 grow-0',
    imageVertical: 'rounded-3xl aspect-square w-full shrink-0 grow-0',
    paddingClasses: 'p-4',
    imageMarginHorizontal: 'my-4',
  },
  md: {
    imageHorizontal: 'rounded-3xl md:w-1/2 shrink-0 grow-0',
    imageVertical: 'rounded-3xl h-48 w-full shrink-0 grow-0',
    paddingClasses: 'p-5',
    imageMarginHorizontal: 'mb-5',
  },
  lg: {
    imageHorizontal: 'rounded-3xl h-full md:w-1/2 shrink-0 grow-0',
    imageVertical: 'rounded-3xl h-64 w-full shrink-0 grow-0',
    paddingClasses: 'p-5',
  },
  xl: {
    imageHorizontal: 'rounded-3xl h-64 md:h-[500px] md:w-1/2 shrink-0 grow-0',
    imageVertical: 'rounded-3xl h-64 w-full shrink-0 grow-0',
    paddingClasses: 'p-8 md:p-12',
  },
}

/**
 * Get size-specific CSS classes
 * @param size - Card size
 * @param layout - Card layout
 * @returns CSS classes for the size and layout
 */
function getSizeClasses(size: CardSize, layout: CardLayout) {
  const sizeClasses = sizeConfig[size]
  const isHorizontal = layout === 'ltr' || layout === 'rtl'

  return {
    ...sizeClasses,
    imageClasses: isHorizontal ? sizeClasses.imageHorizontal : sizeClasses.imageVertical,
  }
}

/**
 * Renders a card with image and slot-based content areas (header, content, footer).
 * @param props - Component props
 * @param props.href - Link destination URL
 * @param props.image - Featured image
 * @param props.header - Header slot content (tags, labels)
 * @param props.content - Main content slot (titles, descriptions)
 * @param props.footer - Footer slot content (metadata, CTAs)
 * @param props.imageOverlay - Content overlay for image (e.g., wishlist button)
 * @param props.imageSizes - Image sizes attribute for optimization
 * @param props.size - Card size: xs, sm, md, lg, xl (default: 'md')
 * @param props.width - Card width: fixed, fit, full (default: 'fixed')
 * @param props.height - Card height: fixed, full (default: 'fixed')
 * @param props.layout - Layout direction: ltr, rtl, ttb, btt (default: 'ttb')
 * @param props.imageShape - Image shape: rectangle, circle (default: 'rectangle')
 * @param props.className - Additional CSS classes
 * @param props.asLink - Whether the entire card is a link (default: false)
 * @param props.visible - Controls entire card visibility (false = hidden from layout)
 * @param props.direction - Language direction for RTL support
 * @param props.noAnimation - Whether to disable hover animations
 * @param props.preload - Whether to preload image (for LCP optimization)
 * @param props.showBackground - Whether to show the card background/shadow (default: true)
 * @param props.linkAriaLabel - Accessible label for overlay link (required when asLink is true)
 * @returns Card component or null if not visible
 */
export function Card({
  href,
  image,
  header,
  content,
  footer,
  imageOverlay,
  size = 'md',
  width = 'fixed',
  height = 'fixed',
  layout = 'ttb',
  imageShape = 'rectangle',
  className = '',
  imageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  asLink = false,
  visible,
  direction,
  noAnimation = false,
  preload = false,
  showBackground = true,
  linkAriaLabel,
}: CardProps) {
  if (visible === false) {
    return null
  }

  const sizeClasses = getSizeClasses(size, layout)
  const isHorizontalLayout = layout === 'ltr' || layout === 'rtl'
  const isVerticalLayout = layout === 'ttb' || layout === 'btt'

  // Hide image for xs/sm sizes in vertical layouts due to insufficient height for content
  const shouldHideImage = isVerticalLayout && size === 'xs'

  const animationClasses = noAnimation
    ? ''
    : `
    m-1 transition-all duration-300
    hover:-translate-y-1 hover:transform hover:border-primary-hover/30
    dark:hover:border-primary-hover/30
    active:scale-[0.98] active:translate-y-0
    `

  const cardClasses = `
    group relative isolate flex shrink-0 snap-start overflow-hidden flex-col min-h-0 min-w-0
    ${showBackground ? 'rounded-xl border border-border bg-card shadow-md dark:shadow-none' : ''}
    ${animationClasses}
    ${width === 'full' ? 'w-full' : width === 'fit' ? 'w-fit' : ''}
    ${height === 'full' ? 'h-full' : height === 'fit' ? 'h-fit' : ''}
    ${className}
  `

  // Inline styles for CSS variable dimensions (Tailwind doesn't interpolate template strings in classes)
  const cardStyle: React.CSSProperties = {
    height: height === 'fixed' ? `var(--height-card-${isVerticalLayout ? 'y' : 'x'}-${size})` : undefined,
    width: width === 'fixed' ? `var(--width-card-${isVerticalLayout ? 'y' : 'x'}-${size})` : undefined,
  }

  const isRTL = direction === DirectionEnum.RTL

  // Circle image sizes based on card size (matching vertical layout heights as diameter)
  const circleImageSizeClasses: Record<CardSize, string> = {
    xs: 'size-10',
    sm: 'size-24',
    md: 'size-36',
    lg: 'size-48',
    xl: 'size-60',
  }

  const imageClassNames =
    imageShape === 'circle'
      ? isHorizontalLayout
        ? `self-center ${circleImageSizeClasses[size]} rounded-full`
        : `mx-auto mt-6 ${circleImageSizeClasses[size]} rounded-full`
      : sizeClasses.imageClasses

  // Apply margin to image in horizontal mode for xs and sm sizes
  // For circle images, skip vertical margin as centering is handled by flex items-center
  const imageMarginClass =
    isHorizontalLayout && sizeClasses.imageMarginHorizontal
      ? (size === 'xs' || size === 'sm') && imageShape === 'rectangle'
        ? `${sizeClasses.imageMarginHorizontal} ${layout === 'ltr' ? 'ms-3' : 'me-3'}`
        : size === 'md'
          ? sizeClasses.imageMarginHorizontal
          : ''
      : ''

  const imageContainerClasses = `
    relative overflow-hidden bg-muted
    ${imageClassNames}
    ${imageMarginClass}
  `

  const contentContainerClasses = `flex flex-col flex-1 justify-center min-h-0 min-w-0 ${sizeClasses.paddingClasses}`

  // Footer classes - mt-auto pushes to bottom, pt-4 for spacing, pb-2 to match circle image mt-6 with existing content padding
  const footerClasses = `mt-auto pt-4 ${imageShape === 'circle' ? 'pb-2' : ''}`

  return (
    <div className={cardClasses} style={cardStyle} data-href={href} dir={isRTL ? 'rtl' : 'ltr'}>
      {asLink && (
        <Link href={href} className="absolute inset-0 z-10 cursor-pointer" tabIndex={-1} aria-label={linkAriaLabel} />
      )}

      {isHorizontalLayout ? (
        // Horizontal Layout
        <div className="flex flex-1 flex-col">
          <div
            className={`
              flex flex-1
              ${size === 'xs' || imageShape === 'circle' ? 'items-center' : ''}
              ${layout === 'rtl' ? 'flex-row-reverse' : 'flex-row'}
            `}
          >
            {/* Image */}
            {!shouldHideImage && (
              <div className={imageContainerClasses}>
                <Image
                  image={image}
                  className={`
                  absolute inset-0 size-full object-cover
                  ${!noAnimation ? 'transition-transform duration-500 group-hover:scale-105' : ''}
                `}
                  sizes={imageSizes}
                  fill
                  preload={preload}
                />
                {imageOverlay}
              </div>
            )}

            <div className={contentContainerClasses}>
              {/* Header */}
              {size !== 'xs' && header}

              {/* Content */}
              <div className={size === 'xs' ? undefined : 'flex min-h-0 min-w-0 flex-1 flex-col'}>{content}</div>

              {/* Footer (inline for lg/xl, otherwise below) */}
              {size !== 'xs' && size !== 'sm' && size !== 'md' && footer && (
                <div className={footerClasses}>{footer}</div>
              )}
            </div>
          </div>

          {/* Footer (full width below image for sm/md) */}
          {(size === 'sm' || size === 'md') && footer && (
            <div className={`${sizeClasses.paddingClasses} pt-0`}>{footer}</div>
          )}
        </div>
      ) : (
        // Vertical Layout - use flex-col-reverse for BTT to put image at bottom
        <div
          className={`
          flex flex-1
          ${layout === 'btt' ? 'flex-col-reverse' : 'flex-col'}
        `}
        >
          {/* Image - hidden for xs/sm sizes in vertical layouts */}
          {!shouldHideImage && (
            <div className={imageContainerClasses}>
              <Image
                image={image}
                className={`
                  absolute inset-0 size-full object-cover
                  ${!noAnimation ? 'transition-transform duration-500 group-hover:scale-105' : ''}
                `}
                sizes={imageSizes}
                fill
                preload={preload}
              />
              {imageOverlay}
            </div>
          )}

          {/* Content Wrapper */}
          <div className={contentContainerClasses}>
            {/* Header */}
            {size !== 'xs' && header}
            {/* Content */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">{content}</div>
            {/* Footer */}
            {footer && <div className={footerClasses}>{footer}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Card
