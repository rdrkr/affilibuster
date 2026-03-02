// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ButtonAction Component
 *
 * Client component for rendering interactive buttons with onClick handlers.
 * Use this for buttons that need JavaScript interaction (form submissions, modals, etc.).
 * For navigation-only buttons, use ButtonLink instead (better performance as server component).
 */

'use client'

import { forwardRef } from 'react'

import { DirectionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'

import {
  composeButtonContent,
  getButtonBaseClasses,
  getVisibilityClasses,
  IconSize,
  type ButtonSize,
  type ButtonVariant,
} from './common'

/**
 * Props for the ButtonAction component
 */
export interface ButtonActionProps {
  /** Button data from CMS */
  data?: ElementsButtonEntry | undefined
  /** Text direction for RTL/LTR layout (default: LTR) */
  direction: DirectionEnum
  /** Button visual variant (default: primary) */
  variant?: ButtonVariant
  /** Button size (default: md) */
  size?: ButtonSize
  /** Icon size (default: lg) */
  iconSize?: IconSize
  /** Additional CSS classes */
  className?: string
  /** Click handler (required) */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Whether the button is disabled */
  disabled?: boolean
  /** Custom content to render (overrides data.label) */
  children?: React.ReactNode
  /** Disable hover animations for link variant */
  noAnimation?: boolean
  /** Enable animated text visibility - pass to Label for mode transitions (default: true) */
  showText?: boolean
  /** Controls visibility of entire button - when false, button is hidden from layout */
  visible?: boolean
  /** Whether the button is currently active */
  isActive?: boolean
  /** Whether the element is expanded (for menus/drawers) */
  'aria-expanded'?: boolean
  /** Position of children relative to label (default: 'end') */
  childrenPosition?: 'start' | 'end'
  /** Animation slide direction (default: 'end-to-start') */
  slideDirection?: 'start-to-end' | 'end-to-start'
  /** Additional CSS classes for the label text */
  textClassName?: string
  /** ARIA role attribute for the button element */
  role?: string
  /** Whether the element is selected (for tabs/options) */
  'aria-selected'?: boolean
  /** ID of the element this button controls */
  'aria-controls'?: string
  /** Unique ID for the button element */
  id?: string
  /** Test ID for testing purposes */
  'data-testid'?: string
  /** Accessible label for the button */
  'aria-label'?: string
  /** Whether the element should be inert (non-interactive and hidden from AT) */
  inert?: boolean
  /** HTML button type attribute (default: 'button') */
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Renders an interactive button element with onClick handler.
 * This is a client component for buttons requiring JavaScript interaction.
 * @param props - Component props with CMS button data
 * @param props.data - Button data from CMS
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.iconSize - Icon size
 * @param props.className - Additional CSS classes
 * @param props.onClick - Click handler (required)
 * @param props.disabled - Whether button is disabled
 * @param props.children - Custom content
 * @param props.noAnimation - Disable hover animations for link variant
 * @param props.showText - Enable animated text visibility for mode transitions
 * @param props.visible - Controls entire button visibility (false = hidden from layout)
 * @param props.isActive - Whether the button is currently active
 * @param props.'aria-expanded' - ARIA expanded state
 * @param props.childrenPosition - Position of children relative to label
 * @param props.textClassName - Additional CSS classes for the label text
 * @param props.role - ARIA role attribute for the button element
 * @param props.'aria-selected' - ARIA selected state (for tabs/options)
 * @param props.'aria-controls' - ID of the element this button controls
 * @param props.id - Unique ID for the button element
 * @param props.'data-testid' - Test ID for testing purposes
 * @param props.type - HTML button type attribute (default: 'button')
 * @returns Button action component or null if no data or not visible
 */
export const ButtonAction = forwardRef<HTMLButtonElement, ButtonActionProps>(
  (
    {
      data,
      direction,
      variant = 'primary',
      size = 'md',
      iconSize = 'lg',
      className = '',
      onClick,
      disabled = false,
      children,
      noAnimation = false,
      showText = true,
      visible = true,
      isActive = false,
      'aria-expanded': ariaExpanded,
      childrenPosition = 'end',
      slideDirection = 'end-to-start',
      textClassName,
      role,
      'aria-selected': ariaSelected,
      'aria-controls': ariaControls,
      id,
      'data-testid': dataTestId,
      'aria-label': propsAriaLabel,
      inert,
      type = 'button',
    },
    ref
  ) => {
    const { label } = data ?? {}

    // Determine if button has an icon (from label or children)
    const hasIcon = Boolean(label?.icon) || Boolean(children)

    const baseClasses = getButtonBaseClasses({
      variant,
      size,
      isActive,
      noAnimation,
      showText,
      direction,
      hasIcon,
      className,
    })

    const content = composeButtonContent({
      label,
      children,
      direction,
      iconSize,
      showText,
      childrenPosition,
      textClassName: textClassName ?? '',
    })

    if (!content) {
      return null
    }

    // Get aria-label from prop or nested label (prop takes precedence)
    const ariaLabel = propsAriaLabel ?? label?.ariaDescription

    const visibilityClasses = getVisibilityClasses(visible, direction, slideDirection)

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseClasses} ${visibilityClasses}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-hidden={!visible}
        role={role}
        aria-selected={ariaSelected}
        aria-controls={ariaControls}
        id={id}
        data-testid={dataTestId}
        inert={inert ?? (!visible ? true : undefined)}
      >
        {content}
      </button>
    )
  }
)

ButtonAction.displayName = 'ButtonAction'

export default ButtonAction
