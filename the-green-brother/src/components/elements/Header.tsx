// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Header Component
 *
 * Composite component that renders a header with title, optional subtitle, and alignment.
 * Matches CMS elements.header schema: header Label + subheader Label + alignment
 */

'use client'

import { Label } from '@/components/elements'
import { AlignmentEnum, DirectionEnum, type ElementsHeaderEntry } from '@/lib/generated/types.gen'

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Header data from CMS */
  data: ElementsHeaderEntry | undefined
  /** Heading level for the title (default: 2) */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** Icon size for header (default: lg) */
  headerIconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  /** Icon size for subheader (default: md) */
  subheaderIconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the header text */
  headerClassName?: string
  /** Additional CSS classes for the subheader text */
  subheaderClassName?: string
  /** Language direction for alignment (used when alignment is 'language-direction') */
  direction: DirectionEnum
}

/**
 * Get CSS text alignment class based on alignment value and direction
 * @param alignment - Alignment from CMS
 * @param direction - Language direction
 * @returns Tailwind text alignment class
 */
function getAlignmentClass(alignment: AlignmentEnum, direction: DirectionEnum): string {
  if (alignment === AlignmentEnum.CENTER) {
    return 'text-center justify-center'
  }
  // 'language-direction' - use start/end which respects RTL
  // We use justify-start because flex-direction handles the visual start/end swapping (row vs row-reverse)
  return direction === DirectionEnum.RTL ? 'text-right justify-start' : 'text-left justify-start'
}

/**
 * Renders a header section with title, optional subtitle, and alignment.
 * Composes Label components for title and subtitle.
 * @param props - Component props with CMS header data
 * @param props.data - Header data from CMS
 * @param props.level - Heading level (1-6)
 * @param props.headerIconSize - Icon size for header
 * @param props.subheaderIconSize - Icon size for subheader
 * @param props.className - Container CSS classes
 * @param props.headerClassName - Header text CSS classes
 * @param props.subheaderClassName - Subheader text CSS classes
 * @param props.direction - Language direction for alignment
 * @returns Header component or null if no data
 */
export function Header({
  data,
  level = 2,
  headerIconSize = 'lg',
  subheaderIconSize = 'md',
  className = '',
  headerClassName = '',
  subheaderClassName = '',
  direction,
}: HeaderProps) {
  if (!data) {
    return null
  }

  const { alignment, header, subheader } = data
  const alignmentClass = getAlignmentClass(alignment, direction)

  // Map level to heading tag
  const HeadingTag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  return (
    <div className={`${alignmentClass} ${className}`}>
      {header && (
        <Label
          data={header}
          as={HeadingTag}
          iconSize={headerIconSize}
          className={`font-bold ${alignmentClass} ${headerClassName}`}
          iconClassName="text-primary"
          direction={direction}
        />
      )}
      {subheader && (
        <Label
          data={subheader}
          as="p"
          iconSize={subheaderIconSize}
          className={`mt-4 ${alignmentClass} text-text-secondary-dark ${subheaderClassName}`}
          direction={direction}
        />
      )}
    </div>
  )
}

export default Header
