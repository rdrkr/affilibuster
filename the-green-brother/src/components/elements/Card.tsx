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
export type CardVariant = 'product' | 'blog'

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
}

/**
 * Get variant-specific CSS classes
 * @param variant - Card variant
 * @returns CSS classes for the variant
 */
function getVariantClasses(variant: CardVariant): {
  container: string
  imageHeight: string
} {
  const variants: Record<CardVariant, { container: string; imageHeight: string }> = {
    product: {
      container: 'h-card w-carousel-mobile md:w-carousel-desktop',
      imageHeight: 'h-64',
    },
    blog: {
      container: 'h-card w-blog-carousel-mobile md:w-blog-carousel-desktop',
      imageHeight: 'h-48',
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
 * @returns Card component
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
}: CardProps) {
  const variantClasses = getVariantClasses(variant)

  const cardClasses = `
    group isolate flex shrink-0 snap-start flex-col overflow-hidden
    rounded-xl border border-white/5 bg-surface-dark
    transition-all duration-300
    hover:-translate-y-1 hover:transform hover:border-primary/30
    ${variantClasses.container}
    ${className}
  `

  const content = (
    <>
      <div className={`relative overflow-hidden bg-tertiary-800 ${variantClasses.imageHeight}`}>
        <CMSImage
          image={image}
          fallbackAlt={imageAlt}
          className={`
            h-full w-full object-cover transition-transform duration-500
            group-hover:scale-110
          `}
          fill
          sizes={variant === 'product' ? '320px' : '(max-width: 768px) 85vw, calc((100vw - 4rem) / 3.5)'}
        />
        {imageOverlay}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {tag && (
          <span
            className={`
              mb-2 text-xs font-bold tracking-wider uppercase
              ${variant === 'blog' ? 'self-start rounded bg-primary-900 px-2 py-1 text-white' : 'text-primary'}
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
