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
import { Label } from './Label'

/**
 * Button variant styles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'

/**
 * Button size options
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

/**
 * Props for the ButtonLink component
 */
export interface ButtonLinkProps {
  /** Button data from CMS */
  data?: ElementsButtonEntry | undefined
  /** Link URL (overrides data.url) */
  href?: string
  /** Text direction for RTL/LTR layout (default: LTR) */
  direction: DirectionEnum
  /** Button visual variant (default: primary) */
  variant?: ButtonVariant
  /** Button size (default: md) */
  size?: ButtonSize
  /** Icon size (default: md) */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Additional CSS classes */
  className?: string
  /** Custom content to render (overrides data.label) */
  children?: React.ReactNode
  /** Disable hover animations for link variant */
  noAnimation?: boolean
}

/**
 * Get CSS classes for button variant
 * @param variant - Button variant
 * @param noAnimation - Whether to disable animation for link variant
 * @returns Tailwind CSS classes
 */
function getVariantClasses(variant: ButtonVariant, noAnimation = false): string {
  const variants: Record<ButtonVariant, string> = {
    primary: `
      bg-primary text-background-dark font-bold
      hover:bg-primary-hover
      disabled:bg-tertiary-500 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-white/5 text-primary font-semibold
      hover:bg-primary hover:text-background-dark
      disabled:bg-tertiary-500 disabled:text-tertiary-500 disabled:cursor-not-allowed
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
    link: noAnimation
      ? `
        text-primary font-medium
        hover:text-primary-hover
        disabled:text-tertiary-500 disabled:cursor-not-allowed
      `
      : `
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
/**
 * Get CSS classes for button dimensions (padding, rounded)
 * @param size - Button size
 * @returns Tailwind CSS classes
 */
function getSizeDimensions(size: ButtonSize): string {
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 rounded-md',
    md: 'px-4 py-2 rounded-xl',
    lg: 'px-6 py-3 rounded-xl',
    xl: 'px-8 py-4 rounded-2xl',
    '2xl': 'px-10 py-5 rounded-2xl',
    '3xl': 'px-12 py-6 rounded-3xl',
  }
  return sizes[size]
}

/**
 * Get CSS classes for button text size
 * @param size - Button size
 * @returns Tailwind CSS classes
 */
function getSizeText(size: ButtonSize): string {
  const sizes: Record<ButtonSize, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }
  return sizes[size]
}

/**
 * Renders a link-based button with Label component for content.
 * This is a server component for navigation without interactivity.
 * @param props - Component props with CMS button data
 * @param props.data - Button data from CMS
 * @param props.href - Link URL (overrides data.url)
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.iconSize - Icon size
 * @param props.className - Additional CSS classes
 * @param props.children - Custom content to render (overrides data.label)
 * @param props.noAnimation - Disable hover animations for link variant
 * @returns Button link component or null if no data and no href
 */
export function ButtonLink({
  data,
  href,
  direction,
  variant = 'primary',
  size = 'md',
  iconSize = 'lg',
  className = '',
  children,
  noAnimation = false,
}: ButtonLinkProps) {
  const url = href ?? data?.url

  if (!url) {
    return null
  }

  const { openInNewTab, label } = data ?? {}

  const baseClasses = `
    inline-flex items-center justify-center gap-2 transition-all duration-200
    ${getVariantClasses(variant, noAnimation)}
    ${getSizeText(size)}
    ${variant === 'link' ? 'p-0' : getSizeDimensions(size)}
    ${className}
  `

  // Use children if provided, otherwise fallback to Label component
  let content: React.ReactNode = children

  if (!content && label) {
    content = (
      <Label
        data={label}
        direction={direction}
        as="span"
        iconSize={iconSize}
        display="inline"
        className="items-center"
      />
    )
  }

  // Get aria-label from nested label
  const ariaLabel = label?.ariaDescription

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

export default ButtonLink
