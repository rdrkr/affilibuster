// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Header Component
 *
 * Composite component that renders a header with title, optional subtitle, and alignment.
 * Matches CMS elements.header schema: header Label + subheader Label + alignment
 */

import { AlignmentEnum, DirectionEnum, type ElementsHeaderEntry } from '@/lib/generated/types.gen'
import { Label } from './Label'
import { IconSize } from './common'

/**
 * Header level type
 */
export type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Header data from CMS */
  data: ElementsHeaderEntry | undefined
  /** Heading level for the title (default: 2) */
  level?: HeaderLevel
  /** Icon size for header (default: lg) */
  headerIconSize?: IconSize
  /** Icon size for subheader (default: md) */
  subheaderIconSize?: IconSize
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the header container */
  headerClassName?: string
  /** Additional CSS classes for the header text element (inside Label) */
  headerTextClassName?: string
  /** Additional CSS classes for the subheader container (Label wrapper) */
  subheaderClassName?: string
  /** Additional CSS classes for the subheader text element (inside Label) */
  subheaderTextClassName?: string
  /** Language direction for alignment (used when alignment is 'language-direction') */
  direction: DirectionEnum
  /** Controls visibility of entire header - when false, header is hidden from layout */
  visible?: boolean
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
 * @param props.headerTextClassName - Header text element CSS classes (for text truncation, etc.)
 * @param props.subheaderClassName - Subheader container CSS classes
 * @param props.subheaderTextClassName - Subheader text element CSS classes (for text truncation, etc.)
 * @param props.direction - Language direction for alignment
 * @param props.visible - Controls entire header visibility (false = hidden from layout)
 * @returns Header component or null if no data or not visible
 */
export function Header({
  data,
  level = 2,
  headerIconSize = 'lg',
  subheaderIconSize = 'md',
  className = '',
  headerClassName = '',
  headerTextClassName = '',
  subheaderClassName = '',
  subheaderTextClassName = '',
  direction,
  visible,
}: HeaderProps) {
  if (!data || visible === false) {
    return null
  }

  const { alignment, header, subheader, promoteHeaderIcon } = data
  const alignmentClass = getAlignmentClass(alignment, direction)

  // Map level to heading tag
  const HeadingTag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  // Map defaults for levels if no explicit size class is provided in headerClassName
  const DEFAULT_LEVEL_CLASSES: Record<number, string> = {
    1: 'text-5xl lg:text-7xl md:text-6xl leading-tight tracking-tight',
    2: 'text-4xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-lg',
    6: 'text-base lg:text-sm md:text-lg',
  }
  const defaultSizeClass = DEFAULT_LEVEL_CLASSES[level] ?? 'text-2xl'

  // Map defaults for subheader based on level
  const DEFAULT_SUBHEADER_CLASSES: Record<number, string> = {
    1: 'mt-8 text-lg sm:text-xl md:text-xl text-muted-foreground',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
  }
  const defaultSubheaderClass = DEFAULT_SUBHEADER_CLASSES[level] ?? ''

  // When promoted, render icon separate from text so subheader aligns with header text
  const isPromoted = promoteHeaderIcon ?? false

  if (isPromoted && header?.icon) {
    const isRTL = direction === DirectionEnum.RTL
    return (
      <div className={`${alignmentClass} ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div
          className={`
            flex items-start gap-4
            ${alignment === AlignmentEnum.CENTER ? 'justify-center' : ''}
          `}
        >
          <Label
            data={{ ...header, text: '' }}
            as="span"
            iconSize={headerIconSize}
            promoteIcon
            className="shrink-0"
            iconClassName="text-accent text-shadow-none dark:text-shadow-none"
            direction={direction}
          />
          <div className="flex flex-col">
            <Label
              data={header}
              as={HeadingTag}
              iconSize={headerIconSize}
              hideIcon
              className={`
                font-bold capitalize
                ${direction === DirectionEnum.RTL ? 'text-right' : 'text-left'}
                ${defaultSizeClass}
                ${headerClassName}
              `}
              textClassName={headerTextClassName}
              direction={direction}
            />
            {subheader && (
              <Label
                data={subheader}
                as="p"
                iconSize={subheaderIconSize}
                className={`
                  mt-1
                  ${direction === DirectionEnum.RTL ? 'text-right' : 'text-left'}
                  ${defaultSubheaderClass || 'text-muted-foreground'}
                  ${subheaderClassName}
                `}
                textClassName={subheaderTextClassName}
                direction={direction}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${alignmentClass} ${className}`}>
      {header && (
        <Label
          data={header}
          as={HeadingTag}
          iconSize={headerIconSize}
          promoteIcon={isPromoted}
          className={`font-bold ${alignmentClass} ${defaultSizeClass} ${headerClassName}`}
          textClassName={headerTextClassName}
          iconClassName="text-accent text-shadow-none dark:text-shadow-none"
          direction={direction}
        />
      )}
      {subheader && (
        <Label
          data={subheader}
          as="p"
          iconSize={subheaderIconSize}
          className={`mt-2 ${alignmentClass} ${defaultSubheaderClass || 'text-muted-foreground'} ${subheaderClassName}`}
          textClassName={subheaderTextClassName}
          direction={direction}
        />
      )}
    </div>
  )
}

export default Header
