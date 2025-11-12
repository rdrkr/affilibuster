// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation trail showing current page location
 */

'use client'

import Link from 'next/link'

export interface BreadcrumbItem {
  /**
   * Display label for the breadcrumb item
   */
  label: string
  /**
   * URL path for the breadcrumb link
   */
  href?: string
  /**
   * Whether this is the current/active page (no link)
   */
  isCurrentPage?: boolean
}

export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items to display
   */
  items: BreadcrumbItem[]
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Breadcrumb navigation component showing hierarchical page location.
 * Automatically handles RTL layouts and accessibility.
 *
 * @param props - Breadcrumb component props
 * @returns Rendered breadcrumb navigation
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', isCurrentPage: true },
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
      data-testid="breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isHome = index === 0

          return (
            <li key={index} className="flex items-center">
              {item.href && !item.isCurrentPage ? (
                <Link
                  href={item.href}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  data-testid={isHome ? 'breadcrumb-home' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'
                  }
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <svg
                  className="w-4 h-4 mx-2 text-neutral-400 dark:text-neutral-500 rtl:rotate-180"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
