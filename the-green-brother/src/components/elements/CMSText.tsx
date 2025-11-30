// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Text Component
 *
 * Renders CMS text content with markdown-style formatting.
 * Converts **bold** text to primary-colored spans.
 */

'use client'

import type { ReactNode } from 'react'
import { createElement, Fragment } from 'react'

/**
 * Props for the CMSText component
 */
export interface CMSTextProps {
  /** Text content from CMS (may contain **bold** markers) */
  text: string | undefined | null
  /** HTML element to wrap the text (defaults to span) */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  /** Additional CSS classes */
  className?: string
}

/**
 * Parses markdown-style bold text and renders with primary color.
 * @param text - Text string potentially containing **bold** markers
 * @returns React node with styled bold text
 */
export function resolveTextFormat(text: string): ReactNode {
  const boldPattern = /\*\*([^*]+)\*\*/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let keyIndex = 0

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(createElement('span', { key: `bold-${String(keyIndex++)}`, className: 'text-primary' }, match[1]))
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  if (parts.length === 0) {
    return text
  }

  return parts.length === 1 ? parts[0] : createElement(Fragment, null, ...parts)
}

/**
 * Text component that parses CMS text with markdown formatting.
 * @param props - Component props with CMS text content
 * @param props.text - Text content from CMS (may contain **bold** markers)
 * @param props.as - HTML element to wrap the text
 * @param props.className - Additional CSS classes
 * @returns Formatted text with **bold** converted to primary-colored spans
 * @example
 * ```tsx
 * <CMSText text="Hello **World**" />
 * <CMSText text={header.text} as="h1" className="text-4xl" />
 * ```
 */
export function CMSText({ text, as: Component = 'span', className }: CMSTextProps) {
  if (!text) {
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
  return text.replace(/\*\*([^*]+)\*\*/g, '<span class="text-primary">$1</span>')
}

export default CMSText
