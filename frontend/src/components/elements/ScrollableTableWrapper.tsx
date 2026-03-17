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

import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'
import { ButtonAction } from '@/components/elements/ButtonAction'

/**
 * Scroll state tracking which directions can be scrolled
 */
interface ScrollState {
  /** Whether content can be scrolled toward the start (left in LTR, right in RTL) */
  canScrollStart: boolean
  /** Whether content can be scrolled toward the end (right in LTR, left in RTL) */
  canScrollEnd: boolean
  /** Whether the table has overflow content */
  hasOverflow: boolean
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
    hasOverflow: false,
  })
  const isRTL = direction === DirectionEnum.RTL

  // Find and track the table element inside the wrapper
  useEffect(() => {
    const wrapper = wrapperRef.current
    /* istanbul ignore next - React natively populates this ref before effect runs */
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
          setScrollState({ canScrollStart: false, canScrollEnd: false, hasOverflow: false })
          return
        }

        const normalizedScrollLeft = Math.abs(scrollLeft)
        const maxScroll = scrollWidth - clientWidth

        const atStart = normalizedScrollLeft <= EDGE_THRESHOLD
        const atEnd = normalizedScrollLeft >= maxScroll - EDGE_THRESHOLD

        setScrollState({
          canScrollStart: isRTL ? !atEnd : !atStart,
          canScrollEnd: isRTL ? !atStart : !atEnd,
          hasOverflow,
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
      /* istanbul ignore next - Buttons are disabled if table is null, making this unreachable */
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

  return (
    <div ref={wrapperRef} className={`relative ${className}`} data-testid="scroll-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left scroll button */}
      <ButtonAction
        direction={direction}
        variant="scroll-arrow"
        size="xs"
        iconSize="xl"
        data={{
          url: '',
          openInNewTab: false,
          label: {
            text: '',
            icon: 'chevron_left',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: 'Scroll left',
          },
        }}
        onClick={() => {
          handleScroll(isRTL ? 'end' : 'start')
        }}
        className={`absolute top-1/2 left-2 z-10 aspect-square! -translate-y-1/2 justify-center ${
          scrollState.canScrollStart ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        visible={true}
        inert={!scrollState.canScrollStart}
        data-testid="scroll-left-button"
        aria-label="Scroll left"
        disabled={!scrollState.canScrollStart}
      />

      {/* Right scroll button */}
      <ButtonAction
        direction={direction}
        variant="scroll-arrow"
        size="xs"
        iconSize="xl"
        data={{
          url: '',
          openInNewTab: false,
          label: {
            text: '',
            icon: 'chevron_right',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: 'Scroll right',
          },
        }}
        onClick={() => {
          handleScroll(isRTL ? 'start' : 'end')
        }}
        className={`absolute top-1/2 right-2 z-10 aspect-square! -translate-y-1/2 justify-center ${
          scrollState.canScrollEnd ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        visible={true}
        inert={!scrollState.canScrollEnd}
        data-testid="scroll-right-button"
        aria-label="Scroll right"
        disabled={!scrollState.canScrollEnd}
      />

      {/* Table container - table inside handles its own scroll via prose-table:overflow-x-auto */}
      {children}
    </div>
  )
}

export default ScrollableTableWrapper
