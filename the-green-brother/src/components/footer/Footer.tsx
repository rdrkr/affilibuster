// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Footer Component
 *
 * Dynamic footer that renders columns from CMS.
 * Uses DynamicZone to support horizontal layout markers.
 * All content comes from CMS - no hardcoded strings.
 */

import type { ReactNode } from 'react'

import { ButtonLink, Label, Text, TextBlock } from '@/components/elements'
import { DynamicZone } from '@/components/layout/DynamicZone'
import { getFooter } from '@/lib/content/api'
import type { ApiFooterFooterDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

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
export default async function Footer({ lang, direction }: FooterProps) {
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
        return (
          <TextBlock
            key={column.id ?? index}
            data={column}
            direction={direction}
            className="max-w-54! min-w-54! text-sm md:mx-auto! prose-headings:mt-1! prose-headings:mb-2! prose-p:my-1!"
          />
        )
      }

      case 'call-to-actions.newsletter-signup-cta':
        return (
          <div key={column.id} className="text-neutral-600 dark:text-text-secondary-dark">
            <Text text={column.title} as="h5" className="mb-4 font-bold text-neutral-800 dark:text-text-main-dark" />
            <Text text={column.description} as="p" className="mb-4" />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-8 sm:px-6 lg:px-8">
      {/* Content wrapper with top separator */}
      <div className="border-y border-neutral-200 dark:border-subtle-dark">
        <DynamicZone
          sections={columns}
          renderSection={column => {
            const index = columns.indexOf(column)
            return renderColumn(column, index)
          }}
          direction={direction}
          verticalAlignment="top"
          className="my-8"
        />
      </div>

      <div
        className={`
            flex flex-col items-center justify-between
            md:flex-row dark:border-subtle-dark
            ${isRTL ? 'md:flex-row-reverse' : ''}
          `}
      >
        <Label
          data={copyrightsLabel}
          className="text-xs text-neutral-600 dark:text-text-secondary-dark"
          direction={direction}
        />

        <div
          className={`
            mt-4 flex gap-6
            md:mt-0
          `}
        >
          {quickLinks.map((link, index) => (
            <ButtonLink key={link.id ?? index} data={link} variant="link-2" size="xs" direction={direction} />
          ))}
        </div>
      </div>
    </footer>
  )
}
