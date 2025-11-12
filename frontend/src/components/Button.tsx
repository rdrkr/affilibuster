// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Button component props
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant
  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize
  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean
  /**
   * Button content
   */
  children: React.ReactNode
}

/**
 * Reusable Button component with multiple variants and sizes.
 * This component consolidates all button patterns used across the site.
 *
 * @param props - Button component props
 * @returns Rendered button element
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled = false,
  ...props
}: ButtonProps): React.ReactElement {
  const baseClasses =
    'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-400 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-800 hover:bg-primary-900 text-white shadow-sm',
    secondary: 'bg-secondary-800 hover:bg-secondary-900 text-white shadow-sm',
    ghost:
      'bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200',
    danger: 'bg-error-500 hover:bg-error-600 text-white shadow-sm',
  }

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
