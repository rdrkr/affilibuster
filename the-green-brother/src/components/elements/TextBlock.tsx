// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * TextBlock Component
 *
 * Renders a rich text block with optional header.
 * Content is rendered as HTML from markdown using remark.
 * Uses Header composite for title and subtitle.
 */

import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
// import remarkBreaks from 'remark-breaks'

import {
  DirectionEnum,
  IconPositionEnum,
  type ElementsLabelEntry,
  type ElementsTextBlockEntry,
} from '@/lib/generated/types.gen'
import { ButtonLink } from './ButtonLink'
import { Header } from './Header'
import { Label } from './Label'

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
  const isRTL = direction === DirectionEnum.RTL

  return (
    <div className={isRTL ? 'text-right' : 'text-left'}>
      <Header data={header} level={2} direction={direction} />
      {content && (
        <div
          className={`
            prose mt-2 max-w-none text-sm
            prose-invert prose-headings:my-0
            prose-headings:mb-4
            prose-headings:font-bold
            prose-headings:text-neutral-50
            prose-p:mb-2
            prose-p:text-neutral-200
            prose-blockquote:text-neutral-300
            prose-strong:text-neutral-50
            prose-em:text-neutral-300
            prose-code:text-tertiary-400
            prose-li:text-neutral-200
            prose-img:my-0
          `}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <ReactMarkdown
            // remarkPlugins={[remarkBreaks]}
            components={{
              a: ({ href, children }) => (
                <ButtonLink
                  variant="link"
                  size="sm"
                  href={href ?? ''}
                  direction={direction}
                  className="text-text-secondary-dark no-underline hover:text-text-main-dark"
                >
                  {children}
                </ButtonLink>
              ),
              /* istanbul ignore start -- Custom handlers tested in E2E */
              code: ({ children }: ComponentPropsWithoutRef<'code'>) => {
                let codeText = ''
                if (typeof children === 'string') {
                  codeText = children
                } else if (Array.isArray(children)) {
                  codeText = children.filter(child => typeof child === 'string').join('')
                } else {
                  // In standard ReactMarkdown v9+, children is usually a string or array
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  codeText = String((children as any) ?? '')
                }

                const labelData: ElementsLabelEntry = {
                  icon: '',
                  iconPosition: IconPositionEnum.BEFORE_TEXT,
                  text: codeText,
                  ariaDescription: '',
                }

                return (
                  <Label
                    data={labelData}
                    direction={direction}
                    display="inline"
                    className="text-sm text-text-secondary-dark"
                    hideIcon
                  />
                )
              },
              img: (props: ComponentPropsWithoutRef<'img'>) => {
                const { src, alt, title } = props
                // src can be string or Blob, only use if string
                const safeSrc = typeof src === 'string' ? src : ''
                const safeAlt = alt ?? ''
                const safeTitle = title ?? ''

                const labelData: ElementsLabelEntry = {
                  icon: safeSrc.split('/').pop() ?? '',
                  iconPosition: IconPositionEnum.BEFORE_TEXT,
                  text: safeTitle,
                  ariaDescription: safeAlt,
                }

                return (
                  <Label
                    data={labelData}
                    direction={direction}
                    display="inline"
                    className="-mt-1 align-middle"
                    iconClassName={isRTL ? 'ml-2' : 'mr-2'}
                    iconSize="xl"
                  />
                )
              },
              /* istanbul ignore stop */
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export default TextBlock
