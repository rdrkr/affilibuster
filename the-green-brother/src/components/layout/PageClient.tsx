// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { usePathname } from 'next/navigation'
import { type HTMLAttributes, type ReactNode } from 'react'

import { useLayoutContext } from '@/components/providers'
import { DirectionEnum } from '../../lib/generated'
import { Breadcrumbs, type BreadcrumbsProps } from '../elements/Breadcrumbs'

/**
 * Layout variants for PageClient
 */
export type PageClientLayout = 'wide' | 'narrow'

/**
 * Props for PageClient component
 */
export interface PageClientProps extends HTMLAttributes<HTMLDivElement> {
  /** layout variant */
  layout?: PageClientLayout
  /** Breadcrumbs configuration. If true or object provided, breadcrumbs are shown (requires lang/direction/navigation). */
  breadcrumbs?: boolean | Pick<BreadcrumbsProps, 'customLastCrumbLabel'>
  /** content to render inside the page wrapper */
  children: ReactNode
  /** Additional classes for the children wrapper */
  childrenClassName?: string
}

/**
 * Generic page client wrapper with layout, RTL, and breadcrumbs support.
 * @param props - Component props
 * @param props.layout - Layout variant
 * @param props.breadcrumbs - Breadcrumbs configuration. If provided, breadcrumbs are shown.
 * @param props.children - Content to render
 * @param props.className - Additional classes for the outer wrapper
 * @param props.childrenClassName - Additional classes for the children wrapper
 * @returns Page wrapper div
 */
export function PageClient({
  layout = 'wide',
  breadcrumbs,
  children,
  className = '',
  childrenClassName = '',
  ...props
}: PageClientProps) {
  const { lang, direction, navigation } = useLayoutContext()
  const pathname = usePathname()

  const isRTL = direction === DirectionEnum.RTL
  const showBreadcrumbs = !!breadcrumbs && !!navigation
  const breadcrumbsConfig = typeof breadcrumbs === 'object' ? breadcrumbs : {}

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`
        mx-auto mt-8 mb-16 flex flex-col
        ${layout === 'wide' ? `max-w-7xl` : `max-w-4xl`}
        ${className}
        `}
      {...props}
    >
      {showBreadcrumbs && (
        <Breadcrumbs
          className="mb-8"
          lang={lang}
          direction={direction}
          navigation={navigation}
          pathname={pathname}
          {...breadcrumbsConfig}
        />
      )}

      <div className={`flex flex-col gap-16 ${childrenClassName}`}>{children}</div>
    </div>
  )
}
