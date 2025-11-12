// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'product' | 'info' | 'feature'

/**
 * Card component props
 */
export interface CardProps {
  /**
   * Visual style variant of the card
   * @default 'default'
   */
  variant?: CardVariant
  /**
   * Card content
   */
  children: React.ReactNode
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Click handler for interactive cards
   */
  onClick?: () => void
  /**
   * Whether the card should have hover effects
   * @default true
   */
  hoverable?: boolean
}

/**
 * Reusable Card component with multiple variants.
 * This component consolidates all card patterns used across the site.
 *
 * @param props - Card component props
 * @returns Rendered card element
 *
 * @example
 * ```tsx
 * <Card variant="product" hoverable>
 *   <h3>Product Title</h3>
 *   <p>Product description</p>
 * </Card>
 * ```
 */
export function Card({
  variant = 'default',
  children,
  className = '',
  onClick,
  hoverable = true,
}: CardProps): React.ReactElement {
  const baseClasses = 'bg-white dark:bg-neutral-800 rounded-xl transition-all duration-300'

  const variantClasses: Record<CardVariant, string> = {
    default: 'border border-neutral-200 dark:border-neutral-700 shadow-md',
    product: 'rounded-2xl overflow-hidden shadow-lg border-2 border-primary-100 dark:border-primary-900',
    info: 'p-8 border shadow-lg border-primary-200 dark:border-primary-700',
    feature:
      'bg-primary-100 dark:bg-primary-700 hover:bg-primary-200 dark:hover:bg-primary-600 p-6 text-neutral-900 dark:text-white',
  }

  const hoverClasses = hoverable
    ? variant === 'product'
      ? 'hover:shadow-2xl hover:-translate-y-1 hover:border-tertiary-400 cursor-pointer'
      : variant === 'feature'
        ? 'hover:scale-105 cursor-pointer'
        : variant === 'info'
          ? 'hover:shadow-xl cursor-pointer'
          : 'hover:shadow-lg cursor-pointer'
    : ''

  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`.trim()

  const Component = onClick ? 'button' : 'div'

  return (
    <Component className={classes} onClick={onClick} type={onClick ? 'button' : undefined}>
      {children}
    </Component>
  )
}
