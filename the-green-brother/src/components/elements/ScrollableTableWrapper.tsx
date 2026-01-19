// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * ScrollableTableWrapper Component
 *
 * A wrapper component for tables that adds horizontal scroll indicators.
 * Shows frosted glass arrow buttons when content overflows and can be scrolled.
 * Tracks the actual table element's scroll state and controls it directly.
 * Supports RTL layouts with proper arrow direction logic.
 */

import type { ReactNode, RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { DirectionEnum } from '@/lib/generated/types.gen'
import { Icon } from './Icon'

/**
 * Scroll state tracking which directions can be scrolled
 */
interface ScrollState {
  /** Whether content can be scrolled toward the start (left in LTR, right in RTL) */
  canScrollStart: boolean
  /** Whether content can be scrolled toward the end (right in LTR, left in RTL) */
  canScrollEnd: boolean
}

/**
 * Props for the ScrollableTableWrapper component
 */
export interface ScrollableTableWrapperProps {
  /** Content to wrap (typically a table element) */
  children: ReactNode
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Additional CSS classes */
  className?: string
  /** Reference to the table element to control */
  tableRef?: RefObject<HTMLTableElement | null>
}

/** Scroll amount in pixels per arrow click */
const SCROLL_AMOUNT = 200

/** Debounce delay for scroll state updates in milliseconds */
const SCROLL_DEBOUNCE_MS = 50

/** Threshold in pixels for detecting scroll edges */
const EDGE_THRESHOLD = 2

/**
 * Renders a scrollable wrapper with arrow indicators for horizontal overflow.
 * Arrow buttons appear when content overflows and hide at scroll edges.
 * Tracks the actual table element inside and controls its scroll.
 * Uses frosted glass styling matching Carousel's dot navigation.
 * @param props - Component props
 * @param props.children - Content to wrap (typically a table)
 * @param props.direction - Language direction for RTL support
 * @param props.className - Additional CSS classes
 * @param props.tableRef - Optional reference to the table element to control. If not provided, the component will try to find the first `<table>` element within its children.
 * @returns Scrollable wrapper with arrow indicators
 * @example
 * ```tsx
 * <ScrollableTableWrapper direction={DirectionEnum.LTR}>
 *   <table>...</table>
 * </ScrollableTableWrapper>
 * ```
 */
export function ScrollableTableWrapper({
  children,
  direction,
  className = '',
  tableRef: providedTableRef,
}: ScrollableTableWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollStart: false,
    canScrollEnd: false,
  })
  const isRTL = direction === DirectionEnum.RTL

  // Find and track the table element inside the wrapper
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // Determine which table element to control
    let targetTable: HTMLTableElement | null = null

    if (providedTableRef) {
      targetTable = providedTableRef.current
    } else {
      targetTable = wrapper.querySelector('table')
    }

    if (!targetTable) return
    tableRef.current = targetTable

    const table = tableRef.current

    let timeoutId: ReturnType<typeof setTimeout>

    /**
     * Updates scroll state based on table's scroll position
     */
    const updateScrollState = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = table
        const hasOverflow = scrollWidth > clientWidth

        if (!hasOverflow) {
          setScrollState({ canScrollStart: false, canScrollEnd: false })
          return
        }

        const normalizedScrollLeft = Math.abs(scrollLeft)
        const maxScroll = scrollWidth - clientWidth

        const atStart = normalizedScrollLeft <= EDGE_THRESHOLD
        const atEnd = normalizedScrollLeft >= maxScroll - EDGE_THRESHOLD

        setScrollState({
          canScrollStart: isRTL ? !atEnd : !atStart,
          canScrollEnd: isRTL ? !atStart : !atEnd,
        })
      }, SCROLL_DEBOUNCE_MS)
    }

    updateScrollState()

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(table)

    table.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      table.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [isRTL, providedTableRef])

  /**
   * Handles scroll button clicks - scrolls the table element directly
   * @param scrollDirection - Direction to scroll ('start' or 'end')
   */
  const handleScroll = useCallback(
    (scrollDirection: 'start' | 'end') => {
      const table = tableRef.current
      if (!table) return

      const multiplier = scrollDirection === 'end' ? 1 : -1
      const rtlMultiplier = isRTL ? -1 : 1

      table.scrollBy({
        left: SCROLL_AMOUNT * multiplier * rtlMultiplier,
        behavior: 'smooth',
      })
    },
    [isRTL]
  )

  const showLeftArrow = scrollState.canScrollStart
  const showRightArrow = scrollState.canScrollEnd

  return (
    <div ref={wrapperRef} className={`relative ${className}`} data-testid="scroll-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left scroll button - always rendered for animation, visibility controlled by opacity */}
      <button
        type="button"
        onClick={() => {
          handleScroll(isRTL ? 'end' : 'start')
        }}
        className={`
          absolute top-1/2 left-2 z-10 flex
          size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border
          border-neutral-200 bg-white/50
          shadow-lg backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          hover:bg-white/70
          dark:border-white/10 dark:bg-neutral-800/30
          dark:hover:bg-neutral-800/50
          ${showLeftArrow ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
        aria-label="Scroll left"
        inert={!showLeftArrow ? true : undefined}
        data-testid="scroll-left-button"
      >
        <Icon icon="chevron_left" size="lg" />
      </button>

      {/* Right scroll button - always rendered for animation, visibility controlled by opacity */}
      <button
        type="button"
        onClick={() => {
          handleScroll(isRTL ? 'start' : 'end')
        }}
        className={`
          absolute top-1/2 right-2 z-10
          flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full
          border border-neutral-200 bg-white/50
          shadow-lg backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          hover:bg-white/70
          dark:border-white/10 dark:bg-neutral-800/30
          dark:hover:bg-neutral-800/50
          ${showRightArrow ? 'opacity-100' : 'pointer-events-none opacity-0'}
        `}
        aria-label="Scroll right"
        inert={!showRightArrow ? true : undefined}
        data-testid="scroll-right-button"
      >
        <Icon icon="chevron_right" size="lg" />
      </button>

      {/* Table container - table inside handles its own scroll via prose-table:overflow-x-auto */}
      {children}
    </div>
  )
}

export default ScrollableTableWrapper
