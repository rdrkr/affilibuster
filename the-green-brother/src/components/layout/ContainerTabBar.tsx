// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { ButtonAction } from '@/components/elements/ButtonAction'
import { frostedGlassStyle } from '@/components/elements/common'
import { DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { Tab } from './tabbed-view-types'

/**
 * ContainerTabBar Component
 *
 * Tab bar component with container styling, sliding pill animation,
 * and scroll arrows. Used internally by TabbedView.
 */

interface PillPosition {
  left: number
  width: number
}

/**
 * Props for the ContainerTabBar component
 */
interface ContainerTabBarProps<T> {
  /** Array of tab configurations */
  tabs: Tab<T>[]
  /** Currently active tab key */
  activeKey: string
  /** Callback when tab selection changes */
  onTabChange: (key: string) => void
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
}

/**
 * ContainerTabBar component for rendering tabs in a container style.
 * Includes sliding pill indicator and scroll arrows.
 * @param props - Component props
 * @param props.tabs - Array of tab configurations
 * @param props.activeKey - Currently active tab key
 * @param props.onTabChange - Callback when tab selection changes
 * @param props.direction - Text direction for RTL/LTR layout
 * @returns ContainerTabBar component
 */
export function ContainerTabBar<T = unknown>({ tabs, activeKey, onTabChange, direction }: ContainerTabBarProps<T>) {
  const isRTL = direction === DirectionEnum.RTL

  // Sliding pill indicator state
  const [pillPosition, setPillPosition] = useState<PillPosition>({ left: 0, width: 0 })
  const tabBarRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Scroll arrow state
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)

  /**
   * Update scroll arrow visibility based on scroll position
   */
  const updateScrollArrows = useCallback(() => {
    const container = scrollContainerRef.current

    const scrollLeft = container?.scrollLeft ?? 0
    const scrollWidth = container?.scrollWidth ?? 0
    const clientWidth = container?.clientWidth ?? 0
    const tolerance = 2

    if (isRTL) {
      // In RTL, scrollLeft is negative
      setCanScrollEnd(Math.abs(scrollLeft) > tolerance)
      setCanScrollStart(Math.abs(scrollLeft) + clientWidth < scrollWidth - tolerance)
    } else {
      setCanScrollStart(scrollLeft > tolerance)
      setCanScrollEnd(scrollLeft + clientWidth < scrollWidth - tolerance)
    }
  }, [isRTL])

  /**
   * Update pill indicator position based on active tab button.
   * Accounts for scroll offset of the scroll container for accurate positioning.
   */
  const updatePillPosition = useCallback(() => {
    const activeButton = tabButtonRefs.current.get(activeKey)

    if (!activeButton) return

    // Use offsetLeft relative to scroll container for accuracy regardless of scroll position
    setPillPosition({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    })
  }, [activeKey])

  // Update pill position on active tab change and on mount
  useLayoutEffect(() => {
    updatePillPosition()
  }, [updatePillPosition])

  // Update pill on resize
  useEffect(() => {
    const handleResize = () => {
      updatePillPosition()
      updateScrollArrows()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [updatePillPosition, updateScrollArrows])

  // Monitor scroll for arrow visibility
  useEffect(() => {
    const container = scrollContainerRef.current

    requestAnimationFrame(() => {
      updateScrollArrows()
    })

    const handleScroll = () => {
      updateScrollArrows()
      updatePillPosition()
    }

    container?.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [updateScrollArrows, updatePillPosition])

  /**
   * Scroll tabs by one button width
   * @param scrollDirection - Direction to scroll ('start' or 'end')
   */
  const handleScrollArrowClick = useCallback(
    (scrollDirection: 'start' | 'end') => {
      const container = scrollContainerRef.current

      const scrollAmount = (container?.clientWidth ?? 0) * 0.6
      const direction = scrollDirection === 'end' ? 1 : -1
      const rtlMultiplier = isRTL ? -1 : 1

      container?.scrollBy({
        left: scrollAmount * direction * rtlMultiplier,
        behavior: 'smooth',
      })
    },
    [isRTL]
  )

  /**
   * Store ref for tab button
   * @param key - Tab key
   * @param el - Button element or null
   */
  const setTabButtonRef = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabButtonRefs.current.set(key, el)
    } else {
      tabButtonRefs.current.delete(key)
    }
  }, [])

  return (
    <div
      role="tablist"
      aria-label="Tab navigation"
      ref={tabBarRef}
      data-testid="container-tab-bar"
      className={`
        relative mx-auto flex w-fit max-w-full items-center
        justify-center overflow-hidden rounded-xl border border-border
        bg-card px-0.5 shadow-md
        dark:shadow-none
      `}
    >
      {/* Scroll start arrow – always rendered, visibility via opacity */}
      <ButtonAction
        direction={direction}
        variant="scroll-arrow"
        size="xs"
        iconSize="lg"
        data={{
          url: '',
          openInNewTab: false,
          label: {
            text: '',
            icon: isRTL ? 'chevron_right' : 'chevron_left',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: isRTL ? 'Scroll right' : 'Scroll left',
          },
        }}
        onClick={() => {
          handleScrollArrowClick('start')
        }}
        className={`absolute top-1/2 left-0.5 z-20 aspect-square! -translate-y-1/2 justify-center ${
          canScrollStart ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        visible={true}
        inert={!canScrollStart}
        showText={false}
        aria-label={isRTL ? 'Scroll right' : 'Scroll left'}
        data-testid="tab-scroll-start"
        disabled={!canScrollStart}
      />

      {/* Scrollable tab buttons container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide relative flex items-center overflow-x-auto"
        data-testid="tab-scroll-container"
      >
        {/* Sliding pill indicator – Navigation frosted glass style */}
        <div
          className={`
            absolute inset-y-0 my-auto h-[calc(100%-4px)]
            transition-all duration-300 ease-in-out
            ${frostedGlassStyle}
            dark:bg-white/10!
          `}
          style={{
            transform: `translateX(${String(pillPosition.left)}px)`,
            width: `${String(pillPosition.width)}px`,
          }}
          data-testid="tab-pill-indicator"
        />

        {tabs.map(tab => {
          const isActive = activeKey === tab.key
          return (
            <button
              key={tab.key}
              ref={el => {
                setTabButtonRef(tab.key, el)
              }}
              type="button"
              onClick={() => {
                onTabChange(tab.key)
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              data-testid={`tab-${tab.key}`}
              className={`
                relative z-10 cursor-pointer px-5 py-2.5 text-sm font-medium whitespace-nowrap
                transition-colors duration-300
                ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground active:text-foreground'}
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Scroll end arrow – always rendered, visibility via opacity */}
      <ButtonAction
        direction={direction}
        variant="scroll-arrow"
        size="xs"
        iconSize="lg"
        data={{
          url: '',
          openInNewTab: false,
          label: {
            text: '',
            icon: isRTL ? 'chevron_left' : 'chevron_right',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: isRTL ? 'Scroll left' : 'Scroll right',
          },
        }}
        onClick={() => {
          handleScrollArrowClick('end')
        }}
        className={`absolute top-1/2 right-0.5 z-20 aspect-square! -translate-y-1/2 justify-center ${
          canScrollEnd ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        visible={true}
        inert={!canScrollEnd}
        showText={false}
        aria-label={isRTL ? 'Scroll left' : 'Scroll right'}
        data-testid="tab-scroll-end"
        disabled={!canScrollEnd}
      />
    </div>
  )
}
