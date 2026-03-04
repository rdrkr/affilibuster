// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Resize Hook Module
 *
 * Provides React hook for measuring navigation container space and
 * calculating visibility states for responsive element collapse.
 * Uses ResizeObserver to monitor container width and progressively
 * collapses elements based on available space using DisplayMode groups.
 */

'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import type { DisplayMode } from '@/components/navigation'

/**
 * Visibility thresholds for progressive element collapse (in pixels)
 * These thresholds determine when each visibility stage triggers
 */
export const THRESHOLDS = {
  /** Below this width: end group switches from full to partial (icons only) */
  END_PARTIAL: 1200,
  /** Below this width: start group switches from full to partial (icons only) */
  START_PARTIAL: 1050,
  /** Below this width: start group switches to minimal (nav links to mobile) */
  START_MINIMAL: 900,
  /** Below this width when search expanded: both groups switch to none (only search visible) */
  SEARCH_ONLY: 640, // tailwind sm
} as const

/**
 * Width consumed by expanded search (in pixels)
 * Used to calculate available space when search is expanded
 */
export const SEARCH_EXPANDED_WIDTH = 180

/**
 * Visibility state for navigation elements using DisplayMode groups
 */
export interface NavigationVisibility {
  /** Display mode for start group (brand, home, products, blog, about) */
  startGroupMode: DisplayMode
  /** Display mode for end group (search, theme, language, login, mobile) */
  endGroupMode: DisplayMode
  /** Current navigation container width in pixels */
  navWidth: number
}

/**
 * Return type for the useNavigationResize hook
 */
export interface UseNavigationResizeReturn {
  /** Ref to attach to the navigation container element */
  navRef: React.RefObject<HTMLElement | null>
  /** Current visibility state based on available space */
  visibility: NavigationVisibility
  /** Whether search is currently expanded */
  isSearchExpanded: boolean
  /** Updates search expanded state (triggers visibility recalculation) */
  setSearchExpanded: (expanded: boolean) => void
  /** Updates start group icon availability */
  setStartHasIcons: (hasIcons: boolean) => void
  /** Updates end group icon availability */
  setEndHasIcons: (hasIcons: boolean) => void
  /** Whether initial visibility calculation has completed */
  isReady: boolean
}

/**
 * Default visibility state showing all elements
 */
const DEFAULT_VISIBILITY: NavigationVisibility = {
  startGroupMode: 'full',
  endGroupMode: 'full',
  navWidth: 0,
}

/**
 * Calculates visibility state based on available width
 * @param navWidth - Current navigation container width in pixels
 * @param windowWidth - Current window width in pixels
 * @param isSearchExpanded - Whether search is currently expanded
 * @param startHasIcons - Whether start group items have icons
 * @param endHasIcons - Whether end group items have icons
 * @param _prevStartMode - Previous start group display mode (for hysteresis)
 * @param prevEndMode - Previous end group display mode (for hysteresis)
 * @returns Visibility state for all navigation elements
 */
export function calculateVisibility(
  navWidth: number,
  windowWidth: number,
  isSearchExpanded: boolean,
  startHasIcons = true,
  endHasIcons = true,
  _prevStartMode: DisplayMode = 'full',
  prevEndMode: DisplayMode = 'full'
): NavigationVisibility {
  // Calculate effective width for start group
  // When search is expanded, we have less space available for start items
  const effectiveWidthForStart = isSearchExpanded ? navWidth - SEARCH_EXPANDED_WIDTH : navWidth

  // Special case: when search is expanded in small layouts, hide both groups
  // This gives maximum space to the search input
  if (isSearchExpanded && navWidth < THRESHOLDS.SEARCH_ONLY) {
    return {
      startGroupMode: 'none',
      endGroupMode: 'none',
      navWidth,
    }
  }

  // Determine start group mode based on EFFECTIVE width
  let startGroupMode: DisplayMode = 'full'
  if (effectiveWidthForStart < THRESHOLDS.START_MINIMAL) {
    startGroupMode = 'minimal'
  } else if (effectiveWidthForStart < THRESHOLDS.START_PARTIAL) {
    startGroupMode = 'partial'
  }

  // Apply hysteresis for no-icon state in Start Group
  // If we land in Partial mode but have no icons, we must skip it.
  // We maintain the previous valid state (Stable Hysteresis) to avoid flicker.
  if (!startHasIcons && startGroupMode === 'partial') {
    // If no icons, we skip 'partial' mode.
    // Since 'full' requires more space (which we don't have, hence 'partial'),
    // we must fallback to 'minimal' to ensure content fits.
    // This effectively maps Partial range to Minimal range for icon-less groups.
    startGroupMode = 'minimal'
  }

  // Determine end group mode based on WINDOW width
  let endGroupMode: DisplayMode = 'full'
  if (windowWidth < THRESHOLDS.END_PARTIAL) {
    endGroupMode = 'partial'
  }

  // Apply hysteresis for no-icon state in End Group (logic symmetric to Start Group)
  if (!endHasIcons && endGroupMode === 'partial') {
    if (prevEndMode === 'minimal') {
      endGroupMode = 'minimal' // Actually End Group rarely goes 'minimal' (it's partial or full usually), but keeping generic logic valid
    } else {
      // Default to Full if we don't support 'minimal' for End Group in the same way, or stick to prev
      // End group assumes partial is acceptable if icons exist. If not...
      // End group "Partial" means icons only.
      // If no icons, End group structure implies mostly text.
      // If we skip Partial, we go to... Full? Or do we have a Minimal for End?
      // End Group currently only toggles Full -> Partial based on window width.
      // It does NOT have a Minimal mode in the same sense (it uses Mobile Menu inside EndGroup).
      // So if Partial is bad, we probably want Full?
      // But Full might overflow.
      // If no icons, we likely MUST show text. So Full is the only option that shows text.
      // Unless we hide items.
      endGroupMode = 'full'
    }
  }

  return {
    startGroupMode,
    endGroupMode,
    navWidth,
  }
}

/**
 * React hook for responsive navigation visibility management
 *
 * Uses ResizeObserver to monitor navigation container width and
 * calculates which elements should be visible based on available space.
 * Implements progressive collapse using DisplayMode groups.
 * @returns Navigation resize state and controls
 * @example
 * ```tsx
 * function Navigation() {
 *   const { navRef, visibility, isSearchExpanded, setSearchExpanded } = useNavigationResize()
 *
 *   return (
 *     <nav ref={navRef}>
 *       <NavigationGroup
 *         items={startItems}
 *         displayMode={visibility.startGroupMode}
 *         position="start"
 *       />
 *       <div className="flex-1" />
 *       <NavigationGroup
 *         items={endItems}
 *         displayMode={visibility.endGroupMode}
 *         position="end"
 *       />
 *     </nav>
 *   )
 * }
 * ```
 */
export function useNavigationResize(): UseNavigationResizeReturn {
  const navRef = useRef<HTMLElement | null>(null)
  const [visibility, setVisibility] = useState<NavigationVisibility>(DEFAULT_VISIBILITY)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [startHasIcons, setStartHasIcons] = useState(true)
  const [endHasIcons, setEndHasIcons] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // Use ref to track search expanded state for ResizeObserver
  // (avoids recreating observer on state changes)
  const isSearchExpandedRef = useRef(isSearchExpanded)
  const prevWidthRef = useRef<number>(0)

  // Track when we're transitioning due to search expand/collapse
  // This prevents ResizeObserver from auto-closing search due to internal layout shifts
  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce visibility updates using requestAnimationFrame to prevent race conditions
  const rafIdRef = useRef<number | null>(null)

  /**
   * Debounced visibility update using requestAnimationFrame
   * This batches multiple rapid visibility changes into a single frame
   */
  const updateVisibilityDebounced = useCallback(
    (searchExpanded: boolean) => {
      // Cancel any pending RAF to avoid stale updates
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const nav = navRef.current
        if (nav) {
          const navWidth = nav.getBoundingClientRect().width
          const windowWidth = typeof window !== 'undefined' ? window.innerWidth : navWidth

          // Pass current modes as previous state for hysteresis
          setVisibility(prev => {
            const newVisibility = calculateVisibility(
              navWidth,
              windowWidth,
              searchExpanded,
              startHasIcons,
              endHasIcons,
              prev.startGroupMode,
              prev.endGroupMode
            )
            return newVisibility
          })
        }
        rafIdRef.current = null
      })
    },
    [startHasIcons, endHasIcons]
  )

  /**
   * Updates search expanded state and triggers visibility recalculation
   */
  const setSearchExpanded = useCallback(
    (expanded: boolean): void => {
      if (isSearchExpandedRef.current === expanded) return

      // Mark that we're transitioning - ignore internal resize events during this period
      isTransitioningRef.current = true

      // Clear any pending transition timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }

      // Update ref FIRST, synchronously, before any layout changes trigger ResizeObserver
      isSearchExpandedRef.current = expanded
      setIsSearchExpanded(expanded)

      // Trigger debounced visibility recalculation
      updateVisibilityDebounced(expanded)

      // Allow resize events again after transition settles
      // SearchMenu has nested timeouts: 100ms (expand) + 300ms (dropdown) + 300ms (transition)
      // Using 800ms to fully cover all animation phases
      transitionTimeoutRef.current = setTimeout(() => {
        isTransitioningRef.current = false
        // Update prevWidthRef to current width so future external resizes are detected correctly
        if (navRef.current) {
          prevWidthRef.current = navRef.current.getBoundingClientRect().width
        }
      }, 800)
    },
    [updateVisibilityDebounced]
  )

  // Set up ResizeObserver to monitor navigation container width
  // Uses useLayoutEffect to calculate initial visibility before paint,
  // preventing the navigation from flashing with opacity-0 then fading in.
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) {
      return
    }

    // Calculate initial visibility immediately on mount
    const initialNavWidth = nav.getBoundingClientRect().width
    const initialWindowWidth = typeof window !== 'undefined' ? window.innerWidth : initialNavWidth
    prevWidthRef.current = initialNavWidth
    // Initial calculation doesn't have "prev" state, so defaults are used (no hysteresis yet)
    setVisibility(calculateVisibility(initialNavWidth, initialWindowWidth, false, startHasIcons, endHasIcons))
    setIsReady(true)

    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      // SKIP all processing during transitions to prevent feedback loops
      // When search expands/collapses, internal layout changes cause width changes,
      // but we don't want those to trigger visibility recalculation
      if (isTransitioningRef.current) {
        return
      }

      const navWidth = entry.contentRect.width

      // If width changed significantly and search is expanded, close search
      // This handles external window resizes only (transitions are skipped above)
      if (isSearchExpandedRef.current && Math.abs(navWidth - prevWidthRef.current) > 20) {
        isSearchExpandedRef.current = false
        setIsSearchExpanded(false)
      }
      prevWidthRef.current = navWidth

      // Use requestAnimationFrame to debounce visibility updates from resize events too
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(() => {
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : navWidth
        setVisibility(prev => {
          return calculateVisibility(
            navWidth,
            windowWidth,
            isSearchExpandedRef.current,
            startHasIcons,
            endHasIcons,
            prev.startGroupMode,
            prev.endGroupMode
          )
        })
        rafIdRef.current = null
      })
    })

    resizeObserver.observe(nav)

    return () => {
      resizeObserver.disconnect()
      // Clean up any pending RAF on unmount
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [startHasIcons, endHasIcons]) // Re-run effect if icon config changes to ensure closure captures new values

  return {
    navRef,
    visibility,
    isSearchExpanded,
    setSearchExpanded,
    setStartHasIcons,
    setEndHasIcons,
    isReady,
  }
}
