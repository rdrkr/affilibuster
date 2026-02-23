// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { ReactNode } from 'react'

import {
  DirectionEnum,
  IconPositionEnum,
  type ApiNavigationNavigationDocument,
  type ElementsButtonEntry,
  type LanguageCode,
} from '@/lib/generated/types.gen'

import { ButtonLink } from './ButtonLink'
import { Text } from './Text'

export interface BreadcrumbsProps {
  /** Current language code */
  lang: LanguageCode
  /** Current pathname (pass from server or client parent) */
  pathname: string
  /** Text direction for RTL/LTR layout */
  direction: DirectionEnum
  /** Navigation data from CMS */
  navigation: ApiNavigationNavigationDocument
  /** Additional CSS classes */
  className?: string
  /** Custom label for the last crumb (e.g. page title) */
  customLastCrumbLabel?: ReactNode
}

/**
 * Generic Breadcrumbs component.
 *
 * Auto-resolves path segments and renders navigation crumbs using navigation data from CMS.
 * Uses ButtonLink for navigable crumbs and renders the current page as text.
 * @param root0 - Component props
 * @param root0.lang - Current language code
 * @param root0.pathname - Current pathname
 * @param root0.direction - Text direction
 * @param root0.navigation - Navigation data from CMS
 * @param root0.className - Additional CSS classes
 * @param root0.customLastCrumbLabel - Custom label for the last crumb
 * @returns Breadcrumbs navigation element
 */
export function Breadcrumbs({
  lang,
  pathname,
  direction,
  navigation,
  className = '',
  customLastCrumbLabel,
  ...props
}: BreadcrumbsProps & React.HTMLAttributes<HTMLElement>) {
  const segments = pathname.split('/').filter(Boolean)
  const ignoredSegments = [lang, 'tag'].map(s => s.toLowerCase())
  const pathSegments = segments.filter(s => !ignoredSegments.includes(s.toLowerCase()))
  const defaultClassName = 'text-sm font-light! text-neutral-500! transition-colors! dark:text-tertiary-400!'

  // Map segment names to navigation buttons
  const getButtonForSegment = (segment: string): ElementsButtonEntry | null => {
    const segmentLower = segment.toLowerCase()
    switch (segmentLower) {
      case 'home':
      case '':
        return navigation.homeButton
      case 'blog':
        return navigation.blogButton
      case 'about':
        return navigation.aboutButton
      case 'products':
        return navigation.productsMenu.menuButton
      default:
        return null
    }
  }

  /**
   * Strip markdown formatting from a string.
   * Removes bold, italic, strikethrough, and inline code markers.
   * @param text - Text that may contain markdown formatting
   * @returns Plain text with markdown markers removed
   */
  const stripMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1') // bold **text**
      .replace(/__(.+?)__/g, '$1') // bold __text__
      .replace(/\*(.+?)\*/g, '$1') // italic *text*
      .replace(/_(.+?)_/g, '$1') // italic _text_
      .replace(/~~(.+?)~~/g, '$1') // strikethrough ~~text~~
      .replace(/`(.+?)`/g, '$1') // inline code `text`
  }

  // Helper to format segment label for fallback
  const formatLabel = (segment: string) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }

  // Construct crumbs
  const crumbs = [
    {
      segment: 'home',
      button: navigation.homeButton,
      href: `/${lang}`,
      isLast: pathSegments.length === 0,
    },
    ...pathSegments.map((segment, index) => {
      const href = `/${lang}/${pathSegments.slice(0, index + 1).join('/')}`
      const isLast = index === pathSegments.length - 1
      const button = getButtonForSegment(segment)
      return {
        segment,
        button,
        href,
        isLast,
      }
    }),
  ]

  return (
    <nav
      dir={direction === DirectionEnum.RTL ? 'rtl' : 'ltr'}
      className={`
        flex w-full flex-wrap items-center
        ${direction === DirectionEnum.RTL ? 'me-2' : 'ms-2'}
        ${defaultClassName}
        ${className}
      `}
      {...props}
    >
      {crumbs.map((crumb, _) => {
        const isLastAndCustom = crumb.isLast && customLastCrumbLabel

        // Use button data if available, otherwise fallback to formatted label
        const buttonData: ElementsButtonEntry = crumb.button ?? {
          url: crumb.href,
          label: {
            text: formatLabel(crumb.segment),
            ariaDescription: `Navigate to ${formatLabel(crumb.segment)}`,
            iconPosition: IconPositionEnum.BEFORE_TEXT,
          },
          openInNewTab: false,
        }

        // For links, ensure the URL matches the crumb href (override CMS URL)
        const linkButtonData: ElementsButtonEntry = {
          ...buttonData,
          url: crumb.href,
        }

        const labelText = stripMarkdown(buttonData.label?.text ?? formatLabel(crumb.segment))

        return (
          <div key={crumb.href} className="flex items-center">
            {crumb.isLast ? (
              <span className="truncate font-medium text-neutral-800 dark:text-white">
                {isLastAndCustom ? (
                  typeof customLastCrumbLabel === 'string' ? (
                    <Text text={stripMarkdown(customLastCrumbLabel)} />
                  ) : (
                    customLastCrumbLabel
                  )
                ) : (
                  <Text text={labelText} />
                )}
              </span>
            ) : (
              <>
                <ButtonLink
                  direction={direction}
                  variant="link-1"
                  size="sm"
                  className={`${defaultClassName} hover:text-primary-500! active:text-primary-700!`}
                  data={linkButtonData}
                  noAnimation
                />
                <span
                  className={`
                    material-symbols-outlined mx-2 text-sm
                    ${direction === DirectionEnum.RTL ? 'rotate-180' : ''}
                  `}
                >
                  chevron_right
                </span>
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
