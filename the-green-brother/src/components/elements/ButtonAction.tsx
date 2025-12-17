// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ButtonAction Component
 *
 * Client component for rendering interactive buttons with onClick handlers.
 * Use this for buttons that need JavaScript interaction (form submissions, modals, etc.).
 * For navigation-only buttons, use ButtonLink instead (better performance as server component).
 */

'use client'

import { DirectionEnum, type ElementsButtonEntry } from '@/lib/generated/types.gen'
import { Label } from './Label'

/**
 * Button variant styles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'

/**
 * Button size options
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

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
  /** Icon size (default: md) */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Whether the button is disabled */
  disabled?: boolean
  /** Custom content to render (overrides data.label) */
  children?: React.ReactNode
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
 * Renders an interactive button element with onClick handler.
 * This is a client component for buttons requiring JavaScript interaction.
 * @param props - Component props with CMS button data
 * @param props.data - Button data from CMS
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.iconSize - Icon size
 * @param props.className - Additional CSS classes
 * @param props.onClick - Click handler
 * @param props.disabled - Whether button is disabled
 * @param props.children - Custom content
 * @returns Button action component or null if no data
 */
export function ButtonAction({
  data,
  direction,
  variant = 'primary',
  size = 'md',
  iconSize = 'lg',
  className = '',
  onClick,
  disabled = false,
  children,
}: ButtonActionProps) {
  const { label } = data ?? {}

  const baseClasses = `
    inline-flex items-center justify-center gap-2 transition-all duration-200
    ${getVariantClasses(variant)}
    ${getSizeClasses(size)}
    ${className}
  `

  // Use children if provided, otherwise fallback to Label component
  let content: React.ReactNode = children

  if (!content && label) {
    content = <Label data={label} direction={direction} as="span" iconSize={iconSize} display="inline" />
  }

  if (!content) {
    return null
  }

  // Get aria-label from nested label
  const ariaLabel = label?.ariaDescription

  return (
    <button type="button" className={baseClasses} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {content}
    </button>
  )
}

export default ButtonAction
