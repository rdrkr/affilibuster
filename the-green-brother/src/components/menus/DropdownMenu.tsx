// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { ButtonAction, ButtonLink } from '@/components/elements'
import { frostedGlassStyle, type ButtonSize, type ButtonVariant, type IconSize } from '@/components/elements/common'
import { useScrollToClose } from '@/hooks/useScrollToClose'
import { DirectionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'

/**
 * Alignment options for dropdown positioning
 * - 'start': Aligns to start of reading direction (left in LTR, right in RTL)
 * - 'end': Aligns to end of reading direction (right in LTR, left in RTL)
 */
export type DropdownAlignment = 'start' | 'end'

/**
 * Props for the Dropdown component (presentational panel)
 */
export interface DropdownProps {
  /** Content to render inside the dropdown */
  children: ReactNode
  /** Whether the dropdown is visible */
  isVisible?: boolean
  /** Horizontal alignment relative to reading direction (default: 'start') */
  align?: DropdownAlignment
  /** Custom width for the dropdown (e.g., '500px') */
  width?: string
  /** Text direction for RTL support */
  direction?: DirectionEnum
  /** Additional CSS style for the dropdown container */
  style?: React.CSSProperties
  /** Additional CSS classes for the dropdown container */
  className?: string
  /** Position dropdown relative to trigger instead of nav on mobile (default: false) */
  inlineOnMobile?: boolean
  /** Gap in pixels between trigger button and dropdown panel (default: 8). Negative values pull the dropdown closer to the trigger. */
  triggerGap?: number
  /** Additional CSS classes for the gap element, overrides triggerGap if provided */
  triggerGapClassName?: string
}

/**
 * Presentational dropdown panel with animation
 *
 * Features:
 * - Fixed positioning on mobile, absolute on desktop
 * - Fade-in with scale bounce animation
 * - RTL support with automatic positioning
 * - Customizable width and styling
 * @param props - Component props
 * @param props.children - Content to render inside the dropdown
 * @param props.isVisible - Whether the dropdown is visible (default: false)
 * @param props.align - Horizontal alignment relative to reading direction (default: 'start')
 * @param props.width - Custom width (default: auto)
 * @param props.direction - Text direction for RTL support
 * @param props.style - Custom inline styles
 * @param props.className - Additional CSS classes
 * @param props.inlineOnMobile - Position relative to trigger on mobile (default: false)
 * @param props.triggerGap - Gap in pixels between trigger and dropdown (default: 8)
 * @param props.triggerGapClassName - Custom CSS class for the gap
 * @returns Dropdown panel component
 */
export function Dropdown({
  children,
  isVisible = false,
  align = 'start',
  width,
  direction,
  style,
  className = '',
  inlineOnMobile = false,
  triggerGap = 8,
  triggerGapClassName,
}: DropdownProps) {
  const isRTL = direction === DirectionEnum.RTL

  // Determine positioning based on alignment and RTL
  const positionClasses = (() => {
    if (align === 'start') {
      return isRTL ? 'sm:left-auto' : 'sm:right-auto'
    } else {
      return isRTL ? 'sm:right-auto' : 'sm:left-auto'
    }
  })()

  // Determine transform origin based on alignment and RTL
  const desktopTransformOrigin = (() => {
    if (align === 'start') {
      return isRTL ? 'top right' : 'top left'
    } else {
      return isRTL ? 'top left' : 'top right'
    }
  })()

  const containerStyle = {
    '--dropdown-origin-desktop': desktopTransformOrigin,
    ...style,
    ...(width ? ({ '--dropdown-width': width } as React.CSSProperties) : {}),
  } as React.CSSProperties

  // Mobile positioning: fixed for nav-style, absolute for inline.
  // For inline mode, anchor to the correct edge so the panel extends inward
  // (rightward for LTR, leftward for RTL) without overflowing the viewport.
  // Using a single anchor (not inset-x-0) lets the outer div shrink-wrap to
  // the panel's content width, keeping it within the scroll-close detection zone.
  const mobilePositionClasses = inlineOnMobile
    ? `absolute top-full left-0`
    : 'fixed inset-x-4 top-[calc(var(--nav-top,5rem))]'

  return (
    <div
      className={`
      ${mobilePositionClasses} z-50 mt-4
      sm:absolute sm:inset-x-0 sm:top-[calc(var(--nav-top,1.5rem))]
      ${positionClasses}
      ${isVisible ? 'visible' : 'pointer-events-none'}
    `}
    >
      {/* Hover bridge - covers the gap between button and dropdown. Negative values use margin to pull dropdown closer. */}
      <div
        className={triggerGapClassName}
        style={
          triggerGapClassName
            ? undefined
            : {
                height: triggerGap >= 0 ? `${String(triggerGap)}px` : 0,
                marginTop: triggerGap < 0 ? `${String(triggerGap)}px` : 0,
              }
        }
        aria-hidden="true"
      />

      <div
        className={`
          flex w-auto origin-top flex-col space-y-1 overflow-hidden
          border-y p-2.5 sm:origin-(--dropdown-origin-desktop)
          ${frostedGlassStyle}
          rounded-xl!
          ${width ? 'sm:w-(--dropdown-width)' : 'sm:min-w-40'}
          ${isRTL ? 'items-end text-right' : 'items-start text-left'}
          ${
            isVisible
              ? 'visible animate-[dropdownBounce_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]'
              : 'pointer-events-none animate-[dropdownClose_0.15s_ease-out_forwards]'
          }
          ${className}
        `}
        style={containerStyle}
      >
        {isVisible && children}
      </div>
    </div>
  )
}

/**
 * Trigger button type
 */
export type TriggerType = 'action' | 'link'

/**
 * Props for the DropdownMenu component (wrapper with interaction logic)
 */
export interface DropdownMenuProps {
  /** Dropdown content (rendered inside panel) */
  children: ReactNode
  /** Trigger button data from CMS */
  triggerData: ElementsButtonEntry
  /** Custom content to render inside the trigger button */
  triggerChildren?: ReactNode
  /** Position of triggerChildren relative to label (default: 'end') */
  triggerChildrenPosition?: 'start' | 'end'
  /** Type of trigger button (default: 'action') */
  triggerType?: TriggerType
  /** Button visual variant (default: 'ghost-1') */
  variant?: ButtonVariant
  /** Button size (default: 'sm') */
  size?: ButtonSize
  /** Icon size (default: 'md') */
  iconSize?: IconSize
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Whether to show trigger button text (default: true) */
  showText?: boolean
  /** Whether the menu is visible in the layout (default: true) */
  visible?: boolean
  /** Whether the trigger button is currently active */
  isActive?: boolean
  /** Whether the trigger is disabled */
  disabled?: boolean
  /** Dropdown alignment (default: 'start') */
  align?: DropdownAlignment
  /** Custom dropdown width */
  width?: string
  /** Additional dropdown panel classes */
  dropdownClassName?: string
  /** Test ID for the container */
  testId?: string
  /** Callback when dropdown item is selected (closes dropdown) */
  onSelect?: () => void
  /** Controlled mode: external isOpen state */
  isOpen?: boolean
  /** Controlled mode: callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void
  /** Position dropdown relative to trigger instead of nav on mobile (default: false) */
  inlineOnMobile?: boolean
  /** Gap in pixels between trigger button and dropdown panel (default: 8). Negative values pull the dropdown closer to the trigger. */
  triggerGap?: number
  /** Additional CSS classes for the gap element, overrides triggerGap if provided */
  triggerGapClassName?: string
}

/**
 * Dropdown menu with trigger button and interaction logic
 *
 * Encapsulates common dropdown patterns:
 * - Hover to open (desktop), click to toggle (mobile)
 * - Click outside to close
 * - Scroll to close
 * - Mobile double-tap fix
 * - Container includes both trigger and dropdown for continuous hover area
 * @param props - Component props
 * @param props.children - Dropdown content
 * @param props.triggerData - Trigger button CMS data
 * @param props.triggerChildren - Custom content for trigger button
 * @param props.triggerChildrenPosition - Position of custom content in trigger
 * @param props.triggerType - Type of trigger ('action' | 'link')
 * @param props.variant - Button variant
 * @param props.size - Button size
 * @param props.iconSize - Icon size
 * @param props.direction - Text direction
 * @param props.showText - Whether to show trigger text
 * @param props.visible - Whether menu is visible in layout
 * @param props.isActive - Whether trigger is active
 * @param props.disabled - Whether trigger is disabled
 * @param props.align - Dropdown alignment
 * @param props.width - Dropdown width
 * @param props.dropdownClassName - Dropdown panel classes
 * @param props.testId - Container test ID
 * @param props.onSelect - Callback when item selected
 * @param props.isOpen - Controlled open state
 * @param props.onOpenChange - Controlled open change callback
 * @param props.inlineOnMobile - Position dropdown relative to trigger on mobile
 * @param props.triggerGap - Gap in pixels between trigger and dropdown (default: 8)
 * @param props.triggerGapClassName - Custom CSS class for the gap
 * @returns Dropdown menu component
 */
export function DropdownMenu({
  children,
  triggerData,
  triggerChildren,
  triggerChildrenPosition = 'end',
  triggerType = 'action',
  variant = 'ghost-1',
  size = 'sm',
  iconSize = 'md',
  direction,
  showText = true,
  visible = true,
  isActive = false,
  disabled = false,
  align = 'start',
  width,
  dropdownClassName,
  testId,
  onSelect,
  isOpen: controlledIsOpen,
  onOpenChange,
  inlineOnMobile = false,
  triggerGap,
  triggerGapClassName,
}: DropdownMenuProps) {
  // Support both controlled and uncontrolled modes
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const setIsOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue = typeof value === 'function' ? value(isOpen) : value
      if (isControlled) {
        onOpenChange?.(newValue)
      } else {
        setInternalIsOpen(newValue)
      }
    },
    [isControlled, isOpen, onOpenChange]
  )

  const containerRef = useRef<HTMLDivElement>(null)
  // Fix for mobile double-tap: ignore click if hover just triggered
  const justHoveredRef = useRef(false)

  // Check if children is empty (no content to display)
  const hasContent = React.Children.count(children) > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  // Close on scroll
  useScrollToClose(isOpen, () => {
    setIsOpen(false)
  }, [containerRef])

  const handleToggle = useCallback(
    (_e?: React.MouseEvent) => {
      if (justHoveredRef.current) return
      // Don't open if no content
      if (!hasContent) return
      setIsOpen(prev => !prev)
    },
    [setIsOpen, hasContent]
  )

  const handleMouseEnter = useCallback(() => {
    // Don't open if no content
    if (!hasContent) return
    setIsOpen(true)
    justHoveredRef.current = true
    setTimeout(() => {
      justHoveredRef.current = false
    }, 50)
  }, [setIsOpen, hasContent])

  const handleMouseLeave = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  // Wrap children to add onSelect behavior
  const wrappedChildren = onSelect ? (
    <div
      onClick={() => {
        onSelect()
        setIsOpen(false)
      }}
    >
      {children}
    </div>
  ) : (
    children
  )

  const triggerButton =
    triggerType === 'link' ? (
      <ButtonLink
        data={triggerData}
        direction={direction}
        showText={showText}
        onClick={handleToggle}
        variant={variant}
        iconSize={iconSize}
        size={size}
        isActive={isActive || isOpen}
        visible={visible}
        disabled={disabled}
        aria-expanded={isOpen}
      />
    ) : (
      <ButtonAction
        data={triggerData}
        direction={direction}
        showText={showText}
        onClick={handleToggle}
        variant={variant}
        iconSize={iconSize}
        size={size}
        isActive={isActive || isOpen}
        visible={visible}
        aria-expanded={isOpen}
        childrenPosition={triggerChildrenPosition}
      >
        {triggerChildren}
      </ButtonAction>
    )

  return (
    <div
      ref={containerRef}
      className="group relative"
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {triggerButton}
      <Dropdown
        direction={direction}
        align={align}
        isVisible={isOpen}
        inlineOnMobile={inlineOnMobile}
        {...(width ? { width } : {})}
        {...(dropdownClassName ? { className: dropdownClassName } : {})}
        {...(triggerGap !== undefined ? { triggerGap } : {})}
        {...(triggerGapClassName ? { triggerGapClassName } : {})}
      >
        {wrappedChildren}
      </Dropdown>
    </div>
  )
}

// Re-export for backwards compatibility during migration
export { Dropdown as DropdownPanel }
export type { DropdownProps as DropdownPanelProps }
