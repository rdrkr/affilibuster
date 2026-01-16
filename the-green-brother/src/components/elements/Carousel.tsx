// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Carousel Component
 *
 * A reusable horizontal scroll carousel for displaying items.
 * Used by FeaturedProductsSection, BlogTeaserSection, and TeamSection.
 * Supports RTL layouts and configurable gap sizes.
 */

import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Gap size options for carousel items
 */
export type CarouselGap = 'sm' | 'md' | 'lg'

/**
 * Props for the Carousel component
 */
export interface CarouselProps {
  /** Carousel items */
  children: React.ReactNode
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Gap between items (default: md) */
  gap?: CarouselGap
  /** Additional CSS classes for the carousel container */
  className?: string
  /** Optional accessibility label - when provided, adds role="region" */
  ariaLabel?: string
}

/**
 * Get gap class for the specified size
 * @param gap - Gap size variant
 * @returns Tailwind gap class
 */
function getGapClass(gap: CarouselGap): string {
  const gapClasses: Record<CarouselGap, string> = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }
  return gapClasses[gap]
}

/**
 * Horizontal scroll carousel component.
 * @param props - Component props
 * @param props.children - Carousel items to display
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.gap - Gap between items (default: md)
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Optional accessibility label (adds role="region")
 * @returns Carousel component
 */
export function Carousel({ children, direction, gap = 'md', className = '', ariaLabel }: CarouselProps) {
  const isRTL = direction === DirectionEnum.RTL
  const gapClass = getGapClass(gap)

  return (
    <div
      className={`scrollbar-hide snap-x snap-mandatory overflow-x-auto ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
    >
      <div data-testid="carousel-track" className={`flex w-max min-w-full justify-center ${gapClass}`}>
        {children}
      </div>
    </div>
  )
}

export default Carousel
