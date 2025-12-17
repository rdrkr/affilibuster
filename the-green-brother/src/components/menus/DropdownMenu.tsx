// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Dropdown Menu Component
 *
 * Generic reusable dropdown container with consistent styling and behavior.
 * Provides absolute positioning, transitions, and RTL support.
 */

import type { ReactNode } from 'react'

import { DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Alignment options for dropdown positioning
 */
export type DropdownAlignment = 'left' | 'right'

/**
 * Props for the DropdownMenu component
 */
export interface DropdownMenuProps {
  /** Content to render inside the dropdown */
  children: ReactNode
  /** Whether the dropdown is visible (controlled by parent hover state) */
  isVisible?: boolean
  /** Horizontal alignment of the dropdown */
  align?: DropdownAlignment
  /** Custom width for the dropdown (e.g., '500px', 'w-48', 'w-[calc(100vw-2rem)]') */
  width?: string
  /** Text direction for RTL support */
  direction?: DirectionEnum
  /** Additional CSS classes for the dropdown container */
  className?: string
  /** Additional CSS classes for the inner content wrapper */
  contentClassName?: string
}

/**
 * Generic dropdown menu container with consistent styling
 *
 * Features:
 * - Absolute positioning with configurable alignment
 * - Smooth visibility and opacity transitions
 * - RTL support with automatic positioning
 * - Customizable width and additional styling
 * - Consistent border, background, shadow, and rounded corners
 * @param props - Component props
 * @param props.children - Content to render inside the dropdown
 * @param props.isVisible - Whether the dropdown is visible (default: false)
 * @param props.align - Horizontal alignment ('left' or 'right', default: 'left')
 * @param props.width - Custom width (default: auto)
 * @param props.direction - Text direction for RTL support
 * @param props.className - Additional CSS classes for container
 * @param props.contentClassName - Additional CSS classes for inner wrapper
 * @returns Dropdown menu component
 */
export function DropdownMenu({
  children,
  isVisible = false,
  align = 'left',
  width,
  direction = DirectionEnum.LTR,
  className = '',
  contentClassName = '',
}: DropdownMenuProps) {
  const isRTL = direction === DirectionEnum.RTL

  // Determine positioning based on alignment and RTL
  const positionClasses = (() => {
    if (align === 'left') {
      return isRTL ? 'right-0' : 'left-0'
    } else {
      return 'right-0'
    }
  })()

  // Apply custom width if provided
  const widthStyle = width ? { width } : {}

  return (
    <div
      className={`
        absolute top-full z-50 pt-6
        transition-all duration-300
        ${positionClasses}
        ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}
        ${className}
      `}
      style={widthStyle}
    >
      <div
        className={`
          overflow-hidden rounded-xl border border-white/10
          bg-surface-dark shadow-xl
          ${contentClassName}
        `}
      >
        {children}
      </div>
    </div>
  )
}

export default DropdownMenu
