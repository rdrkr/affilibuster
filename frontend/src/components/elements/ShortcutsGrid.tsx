// Copyright (c) 2025 Affilibuster by Ronen Druker.

import Link from 'next/link'

import { type ButtonSize, type IconSize } from '@/components/elements/common'
import { type HeaderLevel } from '@/components/elements/Header'
import { type DirectionEnum, type ElementsButtonEntry, type ElementsHeaderEntry } from '@/lib/generated/types.gen'
import { Header } from '@/components/elements/Header'
import { Icon } from '@/components/elements/Icon'
import { Text } from '@/components/elements/Text'

/**
 * Props for the ShortcutsGrid component
 */
export interface ShortcutsGridProps {
  /** Optional section header */
  header?: ElementsHeaderEntry
  /** Header level for semantic structure (default: 3) */
  headerLevel?: HeaderLevel
  /** Items to display in the grid */
  items: ElementsButtonEntry[]
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Button size (default: md) */
  buttonSize?: ButtonSize
  /** Icon size (default: 4xl) */
  iconSize?: IconSize
  /** Additional CSS classes for the grid container */
  className?: string
  /** Additional CSS classes for item text */
  textClassName?: string
  /** Disable hover animations and promote icons */
  noAnimation?: boolean
}

/**
 * Generic component for displaying a grid of shortcut items with circular icons.
 * Commonly used for categories, certificates, and other quick-access links.
 * @param props - Component props
 * @param props.header - Optional section header
 * @param props.headerLevel - Header level (default: 3)
 * @param props.items - Items to display in the grid
 * @param props.direction - Language direction for RTL support
 * @param props.buttonSize - Button size (default: md)
 * @param props.iconSize - Icon size (default: 4xl)
 * @param props.className - Additional CSS classes
 * @param props.textClassName - Additional CSS classes for item text
 * @param props.noAnimation - Disable hover animations and promote icons
 * @returns Grid of shortcut items
 */
export function ShortcutsGrid({
  header,
  headerLevel = 3,
  items,
  direction,
  buttonSize = 'md',
  iconSize = '4xl',
  className = '',
  textClassName = '',
  noAnimation = false,
}: ShortcutsGridProps) {
  // Don't render if no items
  if (items.length === 0) {
    return null
  }

  const buttonSizeClasses: Record<ButtonSize, string> = {
    xs: 'size-12',
    sm: 'size-16',
    md: 'size-20',
    lg: 'size-24',
    xl: 'size-28',
    '2xl': 'size-32',
    '3xl': 'size-36',
  }

  // Animation classes
  const containerAnimation = noAnimation
    ? ''
    : `
      ${buttonSizeClasses[buttonSize]}
      transition-[transform,border-color,background-color] duration-300
      bg-card
      border border-border
      group-hover:scale-110 group-hover:border-primary-hover
      group-hover:bg-primary-hover
      group-active:scale-95 group-active:bg-primary-active group-active:border-primary-active
    `

  const iconAnimation = noAnimation
    ? ''
    : `
      transition-colors
      group-hover:text-foreground
      group-active:text-white
    `

  const textAnimation = noAnimation
    ? 'mt-2 text-xs md:text-sm'
    : `
      mt-3 font-semibold
      transition-colors group-hover:text-foreground
      group-active:text-foreground
    `

  const gapSizeClasses: Record<HeaderLevel, string> = {
    1: 'gap-6 md:gap-10',
    2: 'gap-6 md:gap-10',
    3: 'gap-6 md:gap-10',
    4: 'gap-3 md:gap-6',
    5: 'gap-3 md:gap-6',
    6: 'gap-3 md:gap-6',
  }

  // Width classes based on button size to ensure equal distribution
  const animatedContainerWidthClasses: Record<ButtonSize, string> = {
    xs: 'w-20',
    sm: 'w-24',
    md: 'w-28',
    lg: 'w-32',
    xl: 'w-36',
    '2xl': 'w-40',
    '3xl': 'w-44',
  }

  const staticContainerWidthClasses: Record<ButtonSize, string> = {
    xs: 'w-8 md:w-14',
    sm: 'w-10 md:w-16',
    md: 'w-16 md:w-22',
    lg: 'w-20 md:w-26',
    xl: 'w-24 md:w-30',
    '2xl': 'w-28 md:w-34',
    '3xl': 'w-32 md:w-38',
  }

  const widthClass = noAnimation ? staticContainerWidthClasses[buttonSize] : animatedContainerWidthClasses[buttonSize]

  return (
    <section
      aria-label={header?.header?.ariaDescription ?? ''}
      className={`flex flex-col ${gapSizeClasses[headerLevel]} ${className}`}
    >
      {header && <Header data={header} level={headerLevel} direction={direction} />}
      <div
        className={`
          flex flex-wrap justify-center
          ${gapSizeClasses[headerLevel]}
        `}
      >
        {items.map(item => {
          if (!item.label) return null

          const content = (
            <>
              <div
                className={`
                  flex transform items-center justify-center
                  rounded-full shadow-lg
                  ${containerAnimation}
                `}
              >
                <Icon
                  icon={item.label.icon}
                  size={iconSize}
                  promoted={noAnimation}
                  className={`
                    text-muted-foreground
                    ${iconAnimation}
                  `}
                />
              </div>
              <Text
                text={item.label.text}
                as="span"
                className={`
                  w-full text-center text-muted-foreground
                  ${textAnimation}
                  ${textClassName}
                `}
              />
            </>
          )

          const containerClassName = `group flex flex-col items-center ${widthClass}`

          if (item.url && item.url !== '#') {
            return (
              <Link
                key={item.id}
                href={item.url}
                className={containerClassName}
                aria-label={item.label.ariaDescription}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
              >
                {content}
              </Link>
            )
          }

          return (
            <div key={item.id} className={containerClassName}>
              {content}
            </div>
          )
        })}
      </div>
    </section>
  )
}
