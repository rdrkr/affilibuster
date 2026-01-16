// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Card Component
 *
 * A reusable card component for displaying content in a consistent format.
 * Used by FeaturedProductsSection and BlogTeaserSection.
 */

import Link from 'next/link'

import CMSImage from './CMSImage'

/**
 * Card variant type
 */
export type CardVariant = 'product' | 'blog' | 'profile'

/**
 * Props for the Card component
 */
export interface CardProps {
  /** Link destination URL */
  href: string
  /** Featured image URL or image object */
  image?: { url?: string; alternativeText?: string } | null | undefined
  /** Fallback alt text for the image */
  imageAlt?: string
  /** Optional tag text displayed above the title */
  tag?: string
  /** Content overlay for image (e.g., wishlist button) - positioned absolutely */
  imageOverlay?: React.ReactNode
  /** Main card content (rendered in the body section) */
  children: React.ReactNode
  /** Card variant controlling sizes */
  variant?: CardVariant
  /** Additional CSS classes for the card */
  className?: string
  /** Whether the entire card is a link (default: true) */
  asLink?: boolean
  /** Controls visibility of entire card - when false, card is hidden from layout */
  visible?: boolean
}

/**
 * Get variant-specific CSS classes
 * @param variant - Card variant
 * @returns CSS classes for the variant
 */
function getVariantClasses(variant: CardVariant): {
  container: string
  imageWrapperClass: string
} {
  const variants: Record<CardVariant, { container: string; imageWrapperClass: string }> = {
    product: {
      container: 'h-card w-carousel-mobile md:w-carousel-desktop',
      imageWrapperClass: 'h-64',
    },
    blog: {
      container: 'h-card w-blog-carousel-mobile md:w-blog-carousel-desktop',
      imageWrapperClass: 'h-48',
    },
    profile: {
      container: 'h-auto w-carousel-mobile md:w-carousel-desktop text-center',
      imageWrapperClass: 'w-40 h-40 mx-auto mt-6 rounded-full',
    },
  }
  return variants[variant]
}

/**
 * Renders a card with image, optional tag, and customizable content.
 * @param props - Component props
 * @param props.href - Link destination URL
 * @param props.image - Featured image
 * @param props.imageAlt - Fallback alt text for the image
 * @param props.tag - Optional tag text
 * @param props.imageOverlay - Content overlay for image (e.g., wishlist button)
 * @param props.children - Main card content
 * @param props.variant - Card variant (default: 'product')
 * @param props.className - Additional CSS classes
 * @param props.asLink - Whether the entire card is a link
 * @param props.visible - Controls entire card visibility (false = hidden from layout)
 * @returns Card component or null if not visible
 */
export function Card({
  href,
  image,
  imageAlt = '',
  tag,
  imageOverlay,
  children,
  variant = 'product',
  className = '',
  asLink = true,
  visible,
}: CardProps) {
  if (visible === false) {
    return null
  }

  const variantClasses = getVariantClasses(variant)

  const cardClasses = `
    group isolate flex shrink-0 snap-start flex-col overflow-hidden m-2
    rounded-xl border border-neutral-200 bg-white shadow-md
    transition-all duration-300
    hover:-translate-y-1 hover:transform hover:border-primary/30
    dark:border-white/5 dark:bg-surface-dark dark:shadow-none
    ${variantClasses.container}
    ${className}
  `

  const sizes =
    variant === 'product'
      ? '320px'
      : variant === 'profile'
        ? '160px'
        : '(max-width: 768px) 85vw, calc((100vw - 4rem) / 3.5)'

  const content = (
    <>
      <div
        className={`relative overflow-hidden bg-neutral-100 dark:bg-tertiary-800 ${variantClasses.imageWrapperClass}`}
      >
        <CMSImage
          image={image}
          fallbackAlt={imageAlt}
          className={`
            size-full object-cover transition-transform duration-500
            group-hover:scale-110
          `}
          fill
          sizes={sizes}
        />
        {imageOverlay}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {tag && (
          <span
            className={`
              mb-2 text-xs font-bold tracking-wider uppercase
              ${variant === 'blog' ? 'self-start rounded-sm bg-primary-900 px-2 py-1 text-white' : 'text-primary'}
            `}
          >
            {tag}
          </span>
        )}
        {children}
      </div>
    </>
  )

  if (asLink) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    )
  }

  return (
    <div className={cardClasses} data-href={href}>
      {content}
    </div>
  )
}

export default Card
