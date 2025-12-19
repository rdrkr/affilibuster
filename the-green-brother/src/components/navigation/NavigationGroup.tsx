// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * NavigationGroup Component
 *
 * Renders navigation item groups with responsive display modes.
 * Uses render props pattern for flexible child rendering.
 */

'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Display mode for navigation groups
 * - full: All elements visible with text
 * - partial: Icons only (text hidden)
 * - minimal: Only brand visible, others moved to mobile menu
 * - none: Group hidden entirely
 */
export type DisplayMode = 'full' | 'partial' | 'minimal' | 'none'

/**
 * Context passed to children via render props
 */
export interface NavigationGroupContext {
  /** Whether text labels should be shown */
  showText: boolean
  /** Current display mode */
  displayMode: DisplayMode
}

/**
 * Props for NavigationGroup component
 */
export interface NavigationGroupProps {
  /** Current display mode */
  displayMode: DisplayMode
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Position of group in navigation */
  position: 'start' | 'end'
  /** Render prop for children - receives context with showText */
  children: (context: NavigationGroupContext) => ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * NavigationGroup renders navigation items with responsive display modes.
 * Uses render props pattern to pass showText context to children.
 * @param props - Component props
 * @param props.displayMode - Current display mode
 * @param props.direction - Text direction for RTL support
 * @param props.position - Position of the group (start or end)
 * @param props.children - Render prop receiving context
 * @param props.className - Additional CSS classes
 * @returns NavigationGroup component or null if displayMode is 'none'
 */
export function NavigationGroup({ displayMode, direction, position, children, className = '' }: NavigationGroupProps) {
  const isRTL = direction === DirectionEnum.RTL

  // If partial mode but no icons, switch to minimal
  // (partial mode shows only icons, so if no icons, there's nothing to show)
  const effectiveDisplayMode = displayMode

  // Calculate context for children
  const context: NavigationGroupContext = useMemo(
    () => ({
      showText: effectiveDisplayMode === 'full',
      displayMode: effectiveDisplayMode,
    }),
    [effectiveDisplayMode]
  )

  return (
    <div
      className={`
        relative z-10 col-start-1 row-start-1 flex shrink-0 items-center
        text-sm font-semibold text-neutral-600 transition-all
        duration-500 dark:text-text-secondary-dark
        ${isRTL ? 'flex-row-reverse' : ''}
        ${isRTL ? 'flex-row-reverse' : ''}
        ${
          position === 'end'
            ? isRTL
              ? 'justify-self-start'
              : 'justify-self-end'
            : isRTL
              ? 'justify-self-end'
              : 'justify-self-start'
        }
        ${className}
      `}
      data-testid={`navigation-group-${position}`}
      data-display-mode={effectiveDisplayMode}
    >
      {children(context)}
    </div>
  )
}
