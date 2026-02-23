// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * TextBlock Component
 *
 * Renders a rich text block with optional header.
 * Content is rendered as HTML from markdown using remark.
 * Uses Header composite for title and subtitle.
 */

import {
  DirectionEnum,
  IconPositionEnum,
  type ElementsLabelEntry,
  type ElementsTextBlockEntry,
  type PluginUploadFileDocument,
} from '@/lib/generated/types.gen'
import { type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { ButtonLink } from './ButtonLink'
import { isIconSize } from './common'
import { Header, type HeaderLevel } from './Header'
import { Image } from './Image'
import { Label } from './Label'
import { ScrollableTableWrapper } from './ScrollableTableWrapper'

/**
 * Restrictive sanitization schema for rehype-sanitize.
 * Extends default schema to also allow the <center> tag.
 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'center'],
  attributes: {
    ...defaultSchema.attributes,
  },
}

/**
 * Props for the internal Markdown component.
 */
interface MarkdownProps {
  /** Markdown content to render */
  content: string
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Internal Markdown component that can be used recursively.
 * This is needed because content inside HTML tags (like <center>) may contain
 * unprocessed markdown that needs to be parsed.
 * @param props - Component props
 * @param props.content - Markdown content to render
 * @param props.direction - Language direction for RTL support
 * @returns Rendered markdown as React elements
 */
function Markdown({ content, direction }: MarkdownProps) {
  const isRTL = direction === DirectionEnum.RTL

  /**
   * Creates the custom components configuration for ReactMarkdown.
   * Extracted as a function to allow recursive usage in center handler.
   * @returns Components configuration object
   */
  const createComponents = (): Components => ({
    center: ({ children }: ComponentPropsWithoutRef<'center'>) => {
      if (!children) return null

      // When rehype-raw parses HTML blocks, markdown inside may remain as string
      // In that case, we need to recursively parse it as markdown
      const shouldParseAsMarkdown = typeof children === 'string'

      return (
        <div style={{ textAlign: 'center' }}>
          {shouldParseAsMarkdown ? <Markdown content={children} direction={direction} /> : children}
        </div>
      )
    },
    a: ({ href, children }: ComponentPropsWithoutRef<'a'>) => (
      <ButtonLink data={{ url: href ?? '', openInNewTab: null }} variant="link-2" size="sm" direction={direction}>
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
      const safeTitle = title ?? ''

      // When alt text is a valid icon size (e.g. "xl", "2xl"), treat the image as an
      // inline icon rendered via Label. Otherwise render as a responsive blog image.
      if (isIconSize(alt)) {
        const labelData: ElementsLabelEntry = {
          icon: safeSrc.split('/').pop() ?? '',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          text: safeTitle,
          ariaDescription: safeTitle,
        }

        return (
          <Label
            data={labelData}
            direction={direction}
            display="inline"
            className="-mt-1 align-middle"
            iconClassName={isRTL ? 'ml-2' : 'mr-2'}
            iconSize={alt}
          />
        )
      }

      if (!safeSrc) return null

      const imageDoc: PluginUploadFileDocument = {
        documentId: safeSrc,
        id: safeSrc,
        name: alt ?? '',
        hash: '',
        mime: '',
        size: 0,
        url: safeSrc,
        provider: '',
        publishedAt: '',
        ...(alt ? { alternativeText: alt } : {}),
      }

      return (
        <Image
          image={imageDoc}
          title={safeTitle || undefined}
          width={1000}
          height={500}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
          className="rounded-xl"
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
  })

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      components={createComponents()}
    >
      {content}
    </ReactMarkdown>
  )
}

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
  /** Heading level for the title (default: 3) */
  headerLevel?: HeaderLevel
  /** Additional CSS classes for the header text */
  headerClassName?: string
  /** Additional CSS classes for the subheader container */
  subheaderClassName?: string
  /** Additional CSS classes for the subheader text element */
  subheaderTextClassName?: string
}

/**
 * Renders a text block with header and rich text content.
 * @param props - Component props with CMS text block data
 * @param props.data - TextBlock data from CMS
 * @param props.direction - Language direction for RTL support
 * @param props.visible - Controls entire block visibility (false = hidden from layout)
 * @param props.className - Additional CSS classes
 * @param props.headerLevel - Heading level
 * @param props.headerClassName - Header text classes
 * @param props.subheaderClassName - Subheader container classes
 * @param props.subheaderTextClassName - Subheader text classes
 * @returns TextBlock component or null if not visible
 */
export function TextBlock({
  data,
  direction,
  visible,
  className = '',
  headerLevel = 3,
  headerClassName,
  subheaderClassName = '',
  subheaderTextClassName,
}: TextBlockProps) {
  if (visible === false) {
    return null
  }

  const { header, content } = data
  const isRTL = direction === DirectionEnum.RTL

  const headingsClassName = `
    prose-headings:font-bold prose-headings:text-neutral-800 dark:prose-headings:text-neutral-50
    prose-headings:mb-4
    prose-h1:mt-0
    prose-h2:mt-8
    prose-h3:mt-8
    prose-h4:mt-8
    prose-h5:mt-0
    prose-h6:mt-0
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

  const safeHeaderClassName = headerClassName ?? ''
  const safeSubheaderTextClassName = subheaderTextClassName ?? ''

  // Special styling for level 1 headers (e.g. Privacy Policy, Terms of Service)
  const isLevel1 = headerLevel === 1
  const hasSubheader = !!header?.subheader

  const level1HeaderClass = isLevel1 && !hasSubheader ? 'pb-4' : 'mt-0!'
  const level1SubheaderClass = isLevel1 && hasSubheader ? 'pb-8' : ''

  const finalHeaderClassName = `${safeHeaderClassName} ${level1HeaderClass}`.trim()
  const finalSubheaderClassName =
    `tracking-wide text-neutral-600! dark:text-text-secondary-dark! text-base font-medium! ${subheaderClassName || ''} ${level1SubheaderClass}`.trim()

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
          level={headerLevel}
          direction={direction}
          headerClassName={finalHeaderClassName}
          subheaderClassName={finalSubheaderClassName}
          subheaderTextClassName={safeSubheaderTextClassName}
        />
      )}

      {content && <Markdown content={content} direction={direction} />}
    </div>
  )
}

export default TextBlock
