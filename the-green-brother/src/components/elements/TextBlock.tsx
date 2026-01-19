// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * TextBlock Component
 *
 * Renders a rich text block with optional header.
 * Content is rendered as HTML from markdown using remark.
 * Uses Header composite for title and subtitle.
 */

import { type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  DirectionEnum,
  IconPositionEnum,
  type ElementsLabelEntry,
  type ElementsTextBlockEntry,
} from '@/lib/generated/types.gen'
import { ButtonLink } from './ButtonLink'
import { Header } from './Header'
import { Label } from './Label'
import { ScrollableTableWrapper } from './ScrollableTableWrapper'

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
  /** Controls visibility of entire block - when false, block is hidden from layout */
  visible?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Renders a text block with header and rich text content.
 * @param props - Component props with CMS text block data
 * @param props.data - TextBlock data from CMS
 * @param props.direction - Language direction for RTL support
 * @param props.visible - Controls entire block visibility (false = hidden from layout)
 * @param props.className - Additional CSS classes
 * @returns TextBlock component or null if not visible
 */
export function TextBlock({ data, direction, visible, className = '' }: TextBlockProps) {
  if (visible === false) {
    return null
  }

  const { header, content } = data
  const isRTL = direction === DirectionEnum.RTL

  const headingsClassName = `
    prose-headings:font-bold prose-headings:text-neutral-800
    prose-headings:not-first:mt-8 prose-headings:mb-4
    prose-headings:first:mt-0 dark:prose-headings:text-neutral-50
  `

  const paragraphsClassName = `
    prose-p:mt-0 prose-p:not-last:mb-2 prose-p:last:mb-0
    prose-p:leading-7 prose-p:font-light
    prose-p:text-tertiary-800 dark:prose-p:text-tertiary-300
  `

  const blockquotesClassName = `
    prose-blockquote:rounded-xl prose-blockquote:border prose-blockquote:border-neutral-200
    prose-blockquote:bg-white prose-blockquote:p-4 prose-blockquote:text-neutral-500
    prose-blockquote:shadow-sm dark:prose-blockquote:border-white/5
    ${
      isRTL
        ? 'prose-blockquote:border-r-8 prose-blockquote:border-r-primary-400 dark:prose-blockquote:border-r-primary-400'
        : 'prose-blockquote:border-l-8 prose-blockquote:border-l-primary-400 dark:prose-blockquote:border-l-primary-400'
    }
    dark:prose-blockquote:bg-surface-dark dark:prose-blockquote:text-neutral-300 dark:prose-blockquote:shadow-none
  `

  const codeClassName = `
    prose-code:text-tertiary-600 dark:prose-code:text-tertiary-400
  `

  const strongClassName = `
    prose-strong:text-neutral-800 dark:prose-strong:text-neutral-50
  `

  const emClassName = `
    prose-em:text-neutral-500 dark:prose-em:text-neutral-300
  `

  const listsClassName = `
    prose-li:text-neutral-600 dark:prose-li:text-neutral-200
  `

  const imagesClassName = `
    prose-img:my-0
  `

  const tablesClassName = `
    prose-table:block prose-table:w-full prose-table:overflow-x-auto
    prose-table:my-6 prose-table:rounded-xl
    prose-table:border prose-table:border-neutral-200
    prose-table:bg-white prose-table:shadow-sm
    dark:prose-table:border-white/5 dark:prose-table:bg-surface-dark dark:prose-table:shadow-none
    prose-th:bg-primary prose-th:px-6 prose-th:py-3 prose-th:text-start prose-th:font-semibold
    prose-th:text-neutral-800 prose-th:whitespace-nowrap
    dark:prose-th:bg-primary-dark dark:prose-th:text-background-dark
    prose-td:px-6 prose-td:py-3
    prose-td:text-neutral-500 dark:prose-td:text-neutral-300
  `

  return (
    <div
      className={`
        prose max-w-none text-base prose-neutral dark:prose-invert
        ${headingsClassName}
        ${paragraphsClassName}
        ${strongClassName}
        ${emClassName}
        ${blockquotesClassName}
        ${listsClassName}
        ${codeClassName}
        ${imagesClassName}
        ${tablesClassName}
        ${className}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {header && (
        <Header
          data={header}
          level={3}
          direction={direction}
          subheaderClassName="tracking-wide text-neutral-600! dark:text-text-secondary-dark! text-base font-medium!"
        />
      )}

      {content && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <ButtonLink
                data={{ url: href ?? '', openInNewTab: null }}
                variant="link-2"
                size="sm"
                direction={direction}
              >
                {children}
              </ButtonLink>
            ),
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
                  className="text-sm text-neutral-600 dark:text-text-secondary-dark"
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
            table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
              <ScrollableTableWrapper direction={direction}>
                <table className="scrollbar-hide" {...props}>
                  {children}
                </table>
              </ScrollableTableWrapper>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  )
}

export default TextBlock
