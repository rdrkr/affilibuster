// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Button Component
 *
 * Composite component that renders a button/link with a Label component.
 * Matches CMS elements.button schema: label (nested) + url + openInNewTab
 * Supports RTL/LTR layout via DirectionEnum.
 */

'use client'

import Link from 'next/link'

import { Label } from '@/components/elements'
import { DirectionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'

/**
 * Button variant styles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'

/**
 * Button size options
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Button component
 */
export interface ButtonProps {
  /** Button data from CMS */
  data: ElementsButtonEntry | undefined
  /** Text direction for RTL/LTR layout (default: LTR) */
  direction: DirectionEnum
  /** Button visual variant (default: primary) */
  variant?: ButtonVariant
  /** Button size (default: md) */
  size?: ButtonSize
  /** Icon size (default: md) */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes */
  className?: string
  /** Whether to render as button instead of link (for forms) */
  asButton?: boolean
  /** Click handler (only used when asButton is true) */
  onClick?: () => void
  /** Whether the button is disabled */
  disabled?: boolean
}

/**
 * Get CSS classes for button variant
 * @param variant - Button variant
 * @returns Tailwind CSS classes
 */
function getVariantClasses(variant: ButtonVariant): string {
  const variants: Record<ButtonVariant, string> = {
    primary: `
      bg-primary text-background-dark font-bold
      hover:bg-primary-hover
      disabled:bg-tertiary-500 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-secondary text-white font-bold
      hover:bg-secondary/90
      disabled:bg-tertiary-500 disabled:cursor-not-allowed
    `,
    outline: `
      border-2 border-primary text-primary font-bold
      hover:bg-primary hover:text-background-dark
      disabled:border-tertiary-500 disabled:text-tertiary-500 disabled:cursor-not-allowed
    `,
    ghost: `
      text-primary font-medium
      hover:bg-primary/10
      disabled:text-tertiary-500 disabled:cursor-not-allowed
    `,
    link: `
      text-primary font-medium transition-all duration-300
      hover:scale-105 hover:text-shadow-shimmer
      disabled:text-tertiary-500 disabled:cursor-not-allowed disabled:hover:scale-100
    `,
  }
  return variants[variant]
}

/**
 * Get CSS classes for button size
 * @param size - Button size
 * @returns Tailwind CSS classes
 */
function getSizeClasses(size: ButtonSize): string {
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
  }
  return sizes[size]
}

/**
 * Renders a button or link with Label component for content.
 * Composes Label primitive for icon and text rendering.
 * @param props - Component props with CMS button data
 * @param props.data - Button data from CMS
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.iconSize - Icon size
 * @param props.className - Additional CSS classes
 * @param props.asButton - Render as button element instead of link
 * @param props.onClick - Click handler (when asButton is true)
 * @param props.disabled - Whether button is disabled
 * @returns Button component or null if no data
 */
export function Button({
  data,
  direction,
  variant = 'primary',
  size = 'md',
  iconSize = 'lg',
  className = '',
  asButton = false,
  onClick,
  disabled = false,
}: ButtonProps) {
  if (!data) {
    return null
  }

  const { url, openInNewTab, label } = data

  const baseClasses = `
    inline-flex items-center justify-center gap-2 transition-all duration-200
    ${getVariantClasses(variant)}
    ${getSizeClasses(size)}
    ${className}
  `

  // Use Label component for content rendering, passing direction for RTL/LTR support
  const content = label ? (
    <Label data={label} direction={direction} as="span" iconSize={iconSize} display="inline" />
  ) : null

  // Get aria-label from nested label
  const ariaLabel = label?.ariaDescription

  // Render as button element (for forms, actions)
  if (asButton) {
    return (
      <button type="button" className={baseClasses} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
        {content}
      </button>
    )
  }

  // Render as link
  return (
    <Link
      href={url}
      className={baseClasses}
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
    >
      {content}
    </Link>
  )
}

export default Button
