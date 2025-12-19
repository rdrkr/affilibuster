// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ButtonLink Component
 *
 * Server component for rendering CMS-driven navigation links.
 * Use this for non-interactive buttons (href-based navigation only).
 * For buttons with onClick handlers, use ButtonAction instead.
 */

import Link from 'next/link'

import { DirectionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'

import {
  composeButtonContent,
  getButtonBaseClasses,
  getVisibilityClasses,
  type ButtonSize,
  type ButtonVariant,
  type IconSize,
} from './common'

/**
 * Props for the ButtonLink component
 */
export interface ButtonLinkProps {
  /** Button data from CMS */
  data?: ElementsButtonEntry | undefined
  /** Text direction for RTL/LTR layout (default: LTR) */
  direction: DirectionEnum
  /** Button visual variant (default: primary) */
  variant?: ButtonVariant
  /** Button size (default: md) */
  size?: ButtonSize
  /** Icon size (default: md) */
  iconSize?: IconSize
  /** Additional CSS classes */
  className?: string
  /** Whether the link is disabled (prevents navigation) */
  disabled?: boolean
  /** Custom content to render (overrides data.label) */
  children?: React.ReactNode
  /** Disable hover animations for link variant */
  noAnimation?: boolean
  /** Enable animated text visibility - pass to Label for mode transitions */
  showText?: boolean
  /** Controls visibility of entire button - when false, button is hidden from layout */
  visible?: boolean
  /** Whether the button is currently active */
  isActive?: boolean
  /** Whether the element is expanded (for menus/drawers) */
  'aria-expanded'?: boolean
  /** Position of children relative to label (default: 'end') */
  childrenPosition?: 'start' | 'end'
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  /** Animation slide direction (default: 'end-to-start') */
  slideDirection?: 'start-to-end' | 'end-to-start'
}

/**
 * Renders a link-based button with Label component for content.
 * This is a server component for navigation without interactivity.
 * @param props - Component props with CMS button data
 * @param props.data - Button data from CMS (must include url)
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.iconSize - Icon size
 * @param props.className - Additional CSS classes
 * @param props.disabled - Whether the link is disabled (prevents navigation)
 * @param props.children - Custom content to render (overrides data.label)
 * @param props.noAnimation - Disable hover animations for link variant
 * @param props.showText - Enable animated text visibility for mode transitions
 * @param props.visible - Controls entire button visibility (false = hidden from layout)
 * @param props.isActive - Whether the button is currently active
 * @param props.'aria-expanded' - ARIA expanded state
 * @param props.childrenPosition - Position of children relative to label
 * @param props.onClick - Click handler
 * @param props.slideDirection - Animation slide direction
 * @returns Button link component or null if no data and no href, or not visible
 */
export function ButtonLink({
  data,
  direction,
  variant = 'primary',
  size = 'md',
  iconSize = 'lg',
  className = '',
  disabled = false,
  children,
  noAnimation = false,
  showText = true,
  visible = true,
  isActive = false,
  'aria-expanded': ariaExpanded,
  childrenPosition = 'end',
  onClick,
  slideDirection = 'end-to-start',
}: ButtonLinkProps) {
  const url = data?.url

  if (!url) {
    return null
  }

  const { openInNewTab, label } = data

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

  // We pass childrenPosition to composeButtonContent.
  // composeButtonContent accepts it as defined in common.tsx interface.
  const content = composeButtonContent({
    label,
    children,
    direction,
    iconSize,
    showText,
    childrenPosition,
  })

  if (!content) {
    return null
  }

  // Get aria-label from nested label
  const ariaLabel = label?.ariaDescription

  const visibilityClasses = getVisibilityClasses(visible, direction, slideDirection)

  return (
    <Link
      href={url}
      className={`${baseClasses} ${visibilityClasses} ${disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}`}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-disabled={disabled}
      aria-hidden={!visible}
      {...(onClick ? { onClick } : {})}
    >
      {content}
    </Link>
  )
}

export default ButtonLink
