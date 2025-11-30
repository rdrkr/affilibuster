// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * TextBlock Component
 *
 * Renders a rich text block with optional header.
 * Content is rendered as HTML from the CMS rich text field.
 * Uses Header composite for title and subtitle.
 */

'use client'

import { Header } from '@/components/elements'
import { DirectionEnum, type ElementsTextBlockEntry } from '@/lib/generated/types.gen'

/**
 * Props for the TextBlock component
 */
export interface TextBlockProps {
  /** TextBlock data from CMS */
  data: ElementsTextBlockEntry & {
    __component: 'elements.text-block'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Renders a text block with header and rich text content.
 * @param props - Component props with CMS text block data
 * @param props.data - TextBlock data from CMS
 * @param props.direction - Language direction for RTL support
 * @returns TextBlock component
 */
export function TextBlock({ data, direction }: TextBlockProps) {
  const { header, content } = data

  return (
    <div>
      <Header
        data={header}
        level={3}
        className="mb-4"
        headerClassName="text-2xl text-white"
        subheaderClassName="text-text-secondary-dark"
        direction={direction}
      />
      {content && (
        <div
          className="prose prose-invert max-w-none text-text-secondary-dark"
          dangerouslySetInnerHTML={{ __html: content }}
          dir={direction === DirectionEnum.RTL ? 'rtl' : 'ltr'}
        />
      )}
    </div>
  )
}

export default TextBlock
