// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Text Component
 *
 * Renders CMS text content with markdown-style formatting.
 * Converts **bold** text to accent-colored spans.
 */

import type { ReactNode } from 'react'
import { createElement, Fragment } from 'react'

/**
 * Props for the Text component
 */
export interface TextProps {
  /** Text content from CMS (may contain **bold** markers) */
  text: string | undefined | null
  /** HTML element to wrap the text (defaults to span) */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  /** Additional CSS classes */
  className?: string
  /** Controls visibility - when false, element is hidden from layout */
  visible?: boolean
}

/**
 * Parses markdown-style bold text and renders with primary color.
 * @param text - Text string potentially containing **bold** markers
 * @returns React node with styled bold text
 */
export function resolveTextFormat(text: string): ReactNode {
  // Split by newline (handling both literal \n and escaped \\n) to handle line breaks
  const lines = text.replace(/\\n/g, '\n').split('\n')

  // Helper to format bold text within a line
  const formatLine = (line: string): ReactNode => {
    const boldPattern = /\*\*([^*]+)\*\*/g
    const parts: ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let keyIndex = 0

    while ((match = boldPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      parts.push(
        createElement(
          'span',
          {
            key: `bold-${String(keyIndex++)}`,
            className: 'text-accent-dark text-shadow-sm dark:text-shadow-none',
          },
          match[1]
        )
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    if (parts.length === 0) {
      return line
    }

    return parts.length === 1 ? parts[0] : createElement(Fragment, null, ...parts)
  }

  // Process each line and join with <br />
  const result: ReactNode[] = []
  lines.forEach((line, index) => {
    if (index > 0) {
      result.push(createElement('br', { key: `br-${String(index)}` }))
    }
    result.push(formatLine(line))
  })

  return result.length === 1 ? result[0] : createElement(Fragment, null, ...result)
}

/**
 * Text component that parses CMS text with markdown formatting.
 * @param props - Component props with CMS text content
 * @param props.text - Text content from CMS (may contain **bold** markers)
 * @param props.as - HTML element to wrap the text
 * @param props.className - Additional CSS classes
 * @param props.visible - Controls visibility (false = hidden from layout)
 * @returns Formatted text with **bold** converted to accent-colored spans
 * @example
 * ```tsx
 * <Text text="Hello **World**" />
 * <Text text={header.text} as="h1" className="text-4xl" />
 * <Text text={label} visible={isExpanded} />
 * ```
 */
export function Text({ text, as: Component = 'span', className, visible }: TextProps) {
  if (!text || visible === false) {
    return null
  }

  return <Component className={className}>{resolveTextFormat(text)}</Component>
}

/**
 * Parses markdown-style bold text and returns HTML string.
 * For use with dangerouslySetInnerHTML when React elements aren't suitable.
 * @param text - Text string potentially containing **bold** markers
 * @returns HTML string with styled bold text
 */
export function resolveTextFormatHtml(text: string | undefined | null): string {
  if (!text) {
    return ''
  }
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<span class="text-accent-dark text-shadow-sm dark:text-shadow-none">$1</span>')
    .replace(/(\\n|\n)/g, '<br />')
}

export default Text
