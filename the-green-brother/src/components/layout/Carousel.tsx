// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * Carousel Component
 *
 * A reusable carousel for displaying items in two variants:
 * - standard: horizontal scroll carousel with multiple visible items
 * - hero: single-item display with dot navigation and auto-rotation
 *
 * Used by FeaturedProductsSection, BlogTeaserSection, and TeamSection.
 * Supports RTL layouts and configurable gap sizes.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Gap size options for carousel items
 */
export type CarouselGap = 'sm' | 'md' | 'lg'

/**
 * Carousel display variant
 */
export type CarouselVariant = 'standard' | 'hero'

/**
 * Props for the Carousel component
 */
export interface CarouselProps {
  /** Carousel items */
  children: React.ReactNode
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Carousel display variant (default: standard) */
  variant?: CarouselVariant
  /** Gap between items - only applies to standard variant (default: md) */
  gap?: CarouselGap
  /** Additional CSS classes for the carousel container */
  className?: string
  /** Optional accessibility label - when provided, adds role="region" */
  ariaLabel?: string
  /** Auto-rotation interval in milliseconds for hero variant (default: 5000) */
  autoRotateInterval?: number
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
 * Standard horizontal scroll carousel variant
 * @param props - Component props
 * @param props.children - Carousel items to display
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.gap - Gap between items (default: md)
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Optional accessibility label (adds role="region")
 * @returns Standard carousel JSX
 */
function StandardCarousel({
  children,
  direction,
  gap = 'md',
  className = '',
  ariaLabel,
}: Omit<CarouselProps, 'variant' | 'autoRotateInterval'>) {
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

/**
 * Hero carousel variant with single-item display, dot navigation, and auto-rotation
 * @param props - Component props
 * @param props.children - Carousel items to display
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Optional accessibility label (adds role="region")
 * @param props.autoRotateInterval - Auto-rotation interval in milliseconds (default: 5000)
 * @returns Hero carousel JSX
 */

/**
 * Hero carousel variant with single-item display, dot navigation, and auto-rotation
 * @param props - Component props
 * @param props.children - Carousel items to display
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Optional accessibility label (adds role="region")
 * @param props.gap - Gap between items (default: md)
 * @param props.autoRotateInterval - Auto-rotation interval in milliseconds (default: 5000)
 * @returns Hero carousel JSX
 */
function HeroCarousel({
  children,
  direction,
  className = '',
  ariaLabel,
  gap = 'md',
  autoRotateInterval = 5000,
}: Omit<CarouselProps, 'variant'>) {
  const isRTL = direction === DirectionEnum.RTL
  const items = useMemo(() => React.Children.toArray(children), [children])
  const itemCount = items.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track ref for scrolling
  const trackRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll to a specific slide index
   * @param index - Target slide index
   */
  const scrollToSlide = useCallback((index: number) => {
    if (!trackRef.current) return

    const track = trackRef.current
    const targetChild = track.children[index] as HTMLElement | undefined

    if (targetChild) {
      // offsetLeft is relative to the offsetParent (the track)
      const targetLeft = targetChild.offsetLeft

      track.scrollTo({
        left: targetLeft,
        behavior: 'smooth',
      })
    }
  }, [])

  /**
   * Navigate to the next slide (wraps around)
   */
  const nextSlide = useCallback(() => {
    // Optimistically calculate next index
    const nextIndex = (activeIndex + 1) % itemCount
    scrollToSlide(nextIndex)
  }, [activeIndex, itemCount, scrollToSlide])

  // Handle scroll events to update active index
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      // Debounce scroll updates
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const scrollLeft = track.scrollLeft
        let bestMatch = 0
        let minDiff = Number.MAX_VALUE

        for (let i = 0; i < track.children.length; i++) {
          const child = track.children[i] as HTMLElement
          // Calculate distance from scroll position to child start (works for both LTR/RTL usually)
          const diff = Math.abs(child.offsetLeft - scrollLeft)
          if (diff < minDiff) {
            minDiff = diff
            bestMatch = i
          }
        }

        if (bestMatch !== activeIndex) {
          setActiveIndex(bestMatch)
        }
      }, 50)
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      track.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [activeIndex])

  // Auto-rotation effect
  useEffect(() => {
    if (itemCount <= 1 || isPaused) {
      return
    }

    timerRef.current = setTimeout(nextSlide, autoRotateInterval)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [activeIndex, itemCount, autoRotateInterval, nextSlide, isPaused])

  return (
    <div
      className={`relative ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      onMouseEnter={() => {
        setIsPaused(true)
      }}
      onMouseLeave={() => {
        setIsPaused(false)
      }}
    >
      {/* Slides container - Padding added to prevent shadow clipping */}
      <div
        ref={trackRef}
        data-testid="hero-carousel-track"
        className={`scrollbar-hide -mx-2 -my-12 flex snap-x snap-mandatory overflow-x-auto px-2 py-12 ${getGapClass(gap)}`}
        aria-live="polite"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full min-w-full shrink-0 snap-center select-none"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${String(index + 1)} of ${String(itemCount)}`}
            aria-hidden={index !== activeIndex}
            data-testid={`hero-slide-${String(index)}`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Dot navigation */}
      {itemCount > 1 && (
        <div
          className="
            absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 justify-center gap-2 rounded-full
            border border-neutral-200 bg-white/50
            p-2 shadow-lg backdrop-blur-sm md:bottom-3
            dark:border-white/10 dark:bg-neutral-800/30
          "
          role="tablist"
          aria-label="Carousel navigation"
        >
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to slide ${String(index + 1)}`}
              data-testid={`hero-dot-${String(index)}`}
              className={`size-1.5 cursor-pointer rounded-full transition-colors duration-200 md:size-3 ${
                index === activeIndex
                  ? 'bg-primary-600'
                  : 'bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500'
              }`}
              onClick={() => {
                scrollToSlide(index)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Carousel component supporting standard horizontal scroll and hero single-item variants.
 * @param props - Component props
 * @param props.children - Carousel items to display
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.variant - Display variant: 'standard' or 'hero' (default: standard)
 * @param props.gap - Gap between items (default: md). Applies to both standard and hero variants.
 * @param props.className - Additional CSS classes
 * @param props.ariaLabel - Optional accessibility label (adds role="region")
 * @param props.autoRotateInterval - Auto-rotation interval for hero variant in ms (default: 5000)
 * @returns Carousel component
 */
export function Carousel({
  children,
  direction,
  variant = 'standard',
  gap = 'md',
  className = '',
  ariaLabel,
  autoRotateInterval = 5000,
}: CarouselProps) {
  if (variant === 'hero') {
    return (
      <HeroCarousel
        direction={direction}
        className={className}
        gap={gap}
        autoRotateInterval={autoRotateInterval}
        {...(ariaLabel !== undefined && { ariaLabel })}
      >
        {children}
      </HeroCarousel>
    )
  }

  return (
    <StandardCarousel
      direction={direction}
      gap={gap}
      className={className}
      {...(ariaLabel !== undefined && { ariaLabel })}
    >
      {children}
    </StandardCarousel>
  )
}

export default Carousel
