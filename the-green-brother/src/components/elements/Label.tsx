// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Label Component
 *
 * Composite component that renders a label with optional icon and text.
 * Matches CMS elements.label schema: icon + iconPosition + text + ariaDescription
 * Supports RTL/LTR layout via DirectionEnum.
 */

import { DirectionEnum, IconPositionEnum, type ElementsLabelEntry } from '@/lib/generated/types.gen'
import { CMSIcon } from './CMSIcon'
import { CMSText } from './CMSText'

/**
 * Props for the Label component
 */
export interface LabelProps {
  /** Label data from CMS */
  data: ElementsLabelEntry | undefined
  /** Text direction for RTL/LTR layout (default: LTR) */
  direction: DirectionEnum
  /** HTML tag to use for the text (default: span) */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  /** Icon size (default: md) */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  /** Hide the icon (default: false) */
  hideIcon?: boolean
  /** Promote icon with circular background (default: false) */
  promoteIcon?: boolean
  /** Display mode - 'block' stacks in parent, 'inline' flows inline (default: block) */
  display?: 'block' | 'inline'
  /** Enable animated text visibility - slides/fades text for mode transitions */
  showText?: boolean
  /** Controls visibility of entire label - when false, label is hidden from layout */
  visible?: boolean
  /** Additional CSS classes for the container */
  className?: string
  /** Additional CSS classes for the text */
  textClassName?: string
  /** Additional CSS classes for the icon */
  iconClassName?: string
}

/**
 * Renders a label with optional icon and text.
 * Composes CMSIcon and CMSText primitives.
 * Handles RTL/LTR layout: in RTL, 'before_text' means RIGHT side, 'after_text' means LEFT side.
 * @param props - Component props with CMS label data
 * @param props.data - Label data from CMS
 * @param props.direction - Text direction for RTL/LTR layout
 * @param props.as - HTML tag for text wrapper
 * @param props.iconSize - Size of the icon
 * @param props.hideIcon - Whether to hide the icon
 * @param props.promoteIcon - When true, icon renders with circular background
 * @param props.display - Display mode (block or inline)
 * @param props.showText - When defined, animates text visibility with slide/fade
 * @param props.visible - Controls entire label visibility (false = hidden from layout)
 * @param props.className - Container CSS classes
 * @param props.textClassName - Text CSS classes
 * @param props.iconClassName - Icon CSS classes
 * @returns Label component or null if no data or not visible
 */
export function Label({
  data,
  direction,
  as: Tag = 'span',
  iconSize = 'lg',
  hideIcon = false,
  promoteIcon = false,
  display = 'block',
  showText,
  visible,
  className = '',
  textClassName = '',
  iconClassName = '',
}: LabelProps) {
  if (!data || visible === false) {
    return null
  }

  const { icon, iconPosition, text, ariaDescription } = data

  const iconElement =
    icon && !hideIcon ? (
      <CMSIcon
        icon={icon}
        size={iconSize}
        className={iconClassName}
        ariaLabel={ariaDescription}
        promoted={promoteIcon}
      />
    ) : null

  const displayClass = display === 'inline' ? 'inline-flex' : 'flex'

  // Determine if icon should be rendered first (start) or last (end) based on:
  // - iconPosition from CMS: before_text = start of text, after_text = end of text
  // - direction: In RTL, visual order is reversed, so we use flex-row-reverse
  const isRtl = direction === DirectionEnum.RTL
  const isIconBeforeText = iconPosition === IconPositionEnum.BEFORE_TEXT

  // Animated text wrapper - only used when showText is defined (controlled mode)
  const textElement =
    showText !== undefined ? (
      <span
        className={`
          ${showText ? 'max-w-96 translate-x-0 opacity-100' : 'max-w-0 -translate-x-2 opacity-0'}
        `}
      >
        <CMSText text={text} className={`whitespace-nowrap ${textClassName}`} />
      </span>
    ) : (
      <CMSText text={text} className={textClassName} />
    )

  return (
    <Tag
      className={`${displayClass} flex-row items-center gap-2 ${className}`}
      aria-label={ariaDescription}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {isIconBeforeText && iconElement}
      {textElement}
      {!isIconBeforeText && iconElement}
    </Tag>
  )
}

export default Label
