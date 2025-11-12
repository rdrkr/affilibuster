// Copyright (c) 2025 Affilibuster by Ronen Druker.

import React from 'react'

/**
 * Hero component props
 */
export interface HeroProps {
  /**
   * Main title text (supports **text** for highlighted spans)
   */
  title: string
  /**
   * Optional subtitle text
   */
  subtitle?: string | undefined
  /**
   * Optional additional content to render below subtitle
   */
  children?: React.ReactNode
  /**
   * Additional CSS classes for the container
   */
  className?: string
  /**
   * Title size variant
   * @default 'large'
   */
  size?: 'small' | 'medium' | 'large'
}

/**
 * Reusable Hero component for page headers.
 * This component provides a consistent hero section pattern across all pages.
 * Supports markdown-like bold highlighting with **text** syntax.
 *
 * @param props - Hero component props
 * @returns Rendered hero section
 *
 * @example
 * ```tsx
 * <Hero
 *   title="Welcome to **Affilibuster**"
 *   subtitle="Find the best products"
 * />
 * ```
 */
export function Hero({ title, subtitle, children, className = '', size = 'large' }: HeroProps): React.ReactElement {
  const sizeClasses = {
    small: 'text-4xl md:text-5xl',
    medium: 'text-5xl md:text-6xl',
    large: 'text-5xl md:text-6xl',
  }

  const paddingClasses = {
    small: 'py-12',
    medium: 'py-16',
    large: 'py-20',
  }

  return (
    <section
      className={`bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white ${paddingClasses[size]} ${className}`.trim()}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${sizeClasses[size]} font-bold mb-6`}>
            {title.split('**').map((part: string, i: number) =>
              i % 2 === 1 ? (
                <span key={i} className="text-secondary-400">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </h1>
          {subtitle && <p className="text-xl text-neutral-200">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
