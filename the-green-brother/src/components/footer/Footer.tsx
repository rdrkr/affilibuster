// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Footer Component
 *
 * Dynamic footer that renders columns from CMS.
 * Uses DynamicZone to support horizontal layout markers.
 * All content comes from CMS - no hardcoded strings.
 */

import type { ReactNode } from 'react'

import { ButtonLink, CMSText, Label, TextBlock } from '@/components/elements'
import { DynamicZone } from '@/components/layout/DynamicZone'
import { getFooter } from '@/lib/content/api'
import type { ApiFooterFooterDocument } from '@/lib/generated/types.gen'
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'

/**
 * Union type for footer column components with their discriminators.
 */
type FooterColumn = ApiFooterFooterDocument['columns'][number]

interface FooterProps {
  lang?: string
  /** Text direction for RTL support */
  direction: DirectionEnum
}

/**
 * Generic Footer component that renders dynamic content from CMS.
 * Supports horizontal layout markers for grouping columns.
 * @param props - Component props
 * @param props.lang - Locale code for fetching localized content
 * @param props.direction - Text direction for RTL support
 * @returns Footer component or null if no data
 */
export default async function Footer({ lang = CodeEnum.EN, direction }: FooterProps) {
  const footerData = await getFooter(lang)

  if (!footerData) {
    return null
  }

  const { columns, copyrightsLabel, quickLinks } = footerData

  const isRTL = direction === DirectionEnum.RTL

  /**
   * Render a single column based on its component type.
   * @param column - Footer column with __component discriminator
   * @param index - Index for fallback key
   * @returns JSX element for the column
   */
  const renderColumn = (column: FooterColumn, index: number): ReactNode => {
    switch (column.__component) {
      case 'elements.text-block': {
        return <TextBlock key={column.id ?? index} data={column} direction={direction} />
      }

      case 'call-to-actions.newsletter-signup-cta':
        return (
          <div key={column.id} className="text-neutral-600 dark:text-text-secondary-dark">
            <h5 className="mb-4 font-bold text-neutral-800 dark:text-text-main-dark">
              <CMSText text={column.title} />
            </h5>
            <p className="mb-4">
              <CMSText text={column.description} />
            </p>
            {/* Newsletter form would go here */}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <footer className="mt-20">
      <div
        className={`
        mx-auto max-w-7xl px-4 pb-8
        sm:px-6
        lg:px-8
      `}
      >
        {/* Content wrapper with top separator */}
        <div className="space-y-8 border-t border-neutral-200 dark:border-subtle-dark">
          <DynamicZone
            sections={columns}
            renderSection={column => {
              const index = columns.indexOf(column)
              return renderColumn(column, index)
            }}
            direction={direction}
            verticalAlignment="top"
            horizontalGroupSpacing="pt-12"
          />
        </div>
        <div
          className={`
            mt-12 flex flex-col items-center justify-between
            border-t border-neutral-200 pt-8 text-sm text-neutral-600
            md:flex-row dark:border-subtle-dark
            dark:text-text-secondary-dark ${isRTL ? 'md:flex-row-reverse' : ''}
          `}
        >
          {(() => {
            return (
              <Label
                data={copyrightsLabel}
                className="text-neutral-600 dark:text-text-secondary-dark"
                direction={direction}
              />
            )
          })()}
          <div
            className={`
            mt-4 flex gap-6
            md:mt-0
          `}
          >
            {quickLinks.map((link, index) => (
              <ButtonLink key={link.id ?? index} data={link} variant="link-2" size="sm" direction={direction} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
