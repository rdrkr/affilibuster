// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Footer Component
 *
 * Dynamic footer that renders columns from CMS.
 * Uses DynamicZone to support horizontal layout markers.
 * All content comes from CMS - no hardcoded strings.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button, CMSText, Label } from '@/components/elements'
import { DynamicZone } from '@/components/layout/DynamicZone'
import { getFooter } from '@/lib/content/api'
import type { ApiFooterFooterDocument } from '@/lib/generated/types.gen'
import { CodeEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

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
 * Parse markdown links in text and return array of link objects.
 * @param text - Text containing markdown links like [text](url)
 * @returns Array of parsed link objects
 */
function parseMarkdownLinks(text: string): { text: string; url: string }[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const links: { text: string; url: string }[] = []
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match[1] && match[2]) {
      links.push({ text: match[1], url: match[2] })
    }
  }

  return links
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

  const currentYear = new Date().getFullYear()
  const copyrightText = copyrightsLabel.text.replace('{year}', currentYear.toString())
  const isRTL = direction === DirectionEnum.RTL

  /**
   * Render a single column based on its component type.
   * @param column - Footer column with __component discriminator
   * @param index - Index for fallback key
   * @param isFirstColumn - Whether this is the first column (brand column)
   * @returns JSX element for the column
   */
  const renderColumn = (column: FooterColumn, index: number, isFirstColumn: boolean): ReactNode => {
    switch (column.__component) {
      case 'elements.text-block': {
        // Parse markdown links from content
        const links = column.content ? parseMarkdownLinks(column.content) : []

        return (
          <div key={column.id ?? index}>
            {/* Header with optional icon */}
            {column.header?.header && (
              <Label
                data={column.header.header}
                as="h5"
                iconSize={isFirstColumn ? 'lg' : 'md'}
                className="mb-4 font-bold text-text-main-dark"
                direction={direction}
              />
            )}

            {/* Render as links if markdown links found, otherwise as plain text */}
            {links.length > 0 ? (
              <ul className="space-y-2 text-text-secondary-dark">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.url}
                      className={`
                      transition-colors
                      hover:text-text-main-dark
                    `}
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : column.content ? (
              <p className="text-text-secondary-dark">{column.content}</p>
            ) : null}
          </div>
        )
      }

      case 'call-to-actions.newsletter-signup-cta':
        return (
          <div key={column.id} className="text-text-secondary-dark">
            <h5 className="mb-4 font-bold text-text-main-dark">
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
        mx-auto max-w-7xl border-t border-subtle-dark px-4 pt-12 pb-8
        sm:px-6
        lg:px-8
      `}
      >
        <div className="space-y-8">
          <DynamicZone
            sections={columns}
            renderSection={column => {
              const index = columns.indexOf(column)
              return renderColumn(column, index, index === 0)
            }}
            direction={direction}
          />
        </div>
        <div
          className={`
            mt-12 flex flex-col items-center justify-between
            border-t border-subtle-dark pt-8 text-sm text-text-secondary-dark
            md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''}
          `}
        >
          <Label
            data={{
              text: copyrightText,
              ariaDescription: 'Copyright notice',
              id: 0,
              iconPosition: isRTL ? IconPositionEnum.AFTER_TEXT : IconPositionEnum.BEFORE_TEXT,
            }}
            className="text-text-secondary-dark"
            direction={direction}
          />
          <div
            className={`
            mt-4 flex gap-6
            md:mt-0
          `}
          >
            {quickLinks.map((link, index) => (
              <Button
                key={link.id ?? index}
                data={link}
                variant="link"
                size="sm"
                className="text-text-secondary-dark hover:text-text-main-dark"
                direction={direction}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
