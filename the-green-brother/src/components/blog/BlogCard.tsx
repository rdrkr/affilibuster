// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * BlogCard Component
 *
 * A reusable card component for displaying blog post previews.
 * Used by BlogTeaserSection and BlogClient.
 */

import { ButtonLink, Card, Header, Text } from '@/components/elements'
import type { CardLayout, CardSize, CardSizeModifier } from '@/components/elements/Card'
import { DirectionEnum, type ApiBlogPostBlogPostDocument, type ElementsLabelEntry } from '@/lib/generated/types.gen'

import { HeaderLevel } from '../elements/Header'

/**
 * Props for the BlogCard component
 */
export interface BlogCardProps {
  /** Blog post data from CMS */
  post: ApiBlogPostBlogPostDocument
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Base path for blog post links (default: '/blog') */
  basePath?: string
  /** Card size (default: 'lg') */
  size?: CardSize
  /** Card layout (default: 'ttb' usually, but 'ltr' for 'sm') */
  layout?: CardLayout
  /** Card width */
  width?: CardSizeModifier
  /** Card height */
  height?: CardSizeModifier
  /** Additional CSS classes for the card */
  className?: string
  /** Heading level for semantic hierarchy (default: 4) */
  headingLevel?: HeaderLevel
  /** Whether to disable hover animations */
  noAnimation?: boolean
  /** Whether the card acts as a link (defaults to true) */
  asLink?: boolean
  /** Whether to show the tag/category badge. Defaults to true. */
  showTag?: boolean
  /** Label for read time (e.g. "min read") */
  readTimeMinutesLabel: ElementsLabelEntry
  /** Label for read article button */
  readArticleLabel: ElementsLabelEntry
  /** Whether to preload image (for LCP optimization) */
  preload?: boolean
}

/**
 * Renders a blog post card with image, tag, title, excerpt, author, read time, and CTA.
 * @param props - Component props
 * @param props.post - Blog post data from CMS
 * @param props.direction - Language direction for RTL support
 * @param props.basePath - Base path for blog post links
 * @param props.size - Card size (default: 'lg')
 * @param props.layout - Card layout
 * @param props.width - Card width
 * @param props.height - Card height
 * @param props.className - Additional CSS classes
 * @param props.headingLevel - Heading level (default: 4)
 * @param props.noAnimation - Whether to disable hover animations
 * @param props.asLink - Whether the card acts as a link
 * @param props.showTag - Whether to show tag
 * @param props.readTimeMinutesLabel - Label for read time
 * @param props.readArticleLabel - Label for read article button
 * @param props.preload - Whether to preload image (for LCP optimization)
 * @returns BlogCard component
 */
export function BlogCard({
  post,
  direction,
  basePath = '/blog',
  size = 'lg',
  layout,
  width = 'fixed',
  height = 'fixed',
  className = '',
  headingLevel = 4,
  noAnimation,
  asLink = false,
  showTag = true,
  readTimeMinutesLabel,
  readArticleLabel,
  preload = false,
}: BlogCardProps) {
  const { wideImage, squareImage, tags, content, readTimeInMinutes, slug } = post

  const author = post.author
  const firstTag = tags[0]?.tag.text ?? ''
  const readTimeString = `${String(readTimeInMinutes)} ${readTimeMinutesLabel.text}`
  const authorName = author.lastName ? `${author.firstName} ${author.lastName}` : author.firstName
  const authorAndReadTime = authorName ? `${authorName} • ${readTimeString}` : readTimeString
  const postUrl = `${basePath}/${slug}`

  const isWide = size === 'lg' || size === 'xl'
  const imageToUse = isWide ? wideImage : squareImage

  // Determine layout based on size if not explicitly provided
  // 'sm' size traditionally used side-by-side (ltr)
  const resolvedLayout = layout ?? (size === 'sm' ? 'ltr' : 'ttb')

  // Header slot: Tag
  const headerSlot =
    showTag && firstTag ? (
      <span
        className={`
          me-auto mb-2 w-fit rounded-sm bg-primary-900 px-2
          py-1 text-xs font-bold tracking-wider text-white uppercase
        `}
      >
        {firstTag}
      </span>
    ) : null

  // Content slot: Header with title and excerpt (hide subheader for 'sm' size)
  // Wrapped in flex and overflow-hidden to ensure text truncation works properly in flex containers
  const contentSlot = content.header ? (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Header
        data={
          size === 'sm'
            ? ({ ...content.header, subheader: undefined } as unknown as typeof content.header)
            : content.header
        }
        level={headingLevel}
        direction={direction}
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        headerClassName={`
          leading-snug shrink-0
          text-neutral-800 transition-colors group-hover:text-primary group-hover:text-shadow-sm
          active:text-primary-700
          dark:text-white dark:group-hover:text-shadow-none dark:active:text-primary-400
        `}
        headerTextClassName="line-clamp-2 min-w-0"
        subheaderClassName="flex-1 min-h-0 overflow-hidden flex flex-col"
        subheaderTextClassName="line-clamp-3 min-w-0"
      />
    </div>
  ) : null

  // Footer slot: Author/readTime + ButtonLink
  const footerSlot = (
    <div
      className={`
        pointer-events-none relative z-10
        flex items-center justify-between
        ${resolvedLayout === 'ltr' ? 'flex-row' : ''}
      `}
    >
      {/* Author and Read Time */}
      <Text
        text={authorAndReadTime}
        as="span"
        className={`
          flex items-center text-xs text-neutral-500 dark:text-tertiary-400
        `}
      />

      {/* Read Article Button */}
      <ButtonLink
        data={{
          label: readArticleLabel,
          url: postUrl,
          openInNewTab: false,
        }}
        className={
          asLink
            ? `
            text-neutral-800! transition-colors!
            group-hover:text-primary! group-hover:text-shadow-sm!
            group-active:text-primary-700!
            dark:text-white! dark:group-hover:text-shadow-none!
            dark:group-active:text-primary-400!
            `
            : 'pointer-events-auto'
        }
        textClassName="@max-[300px]:hidden"
        direction={direction}
        variant="link-1"
        iconSize="xs"
        size="xs"
      />
    </div>
  )

  return (
    <Card
      asLink={asLink}
      href={postUrl}
      image={imageToUse}
      header={headerSlot}
      content={contentSlot}
      footer={footerSlot}
      size={size}
      layout={resolvedLayout}
      width={width}
      height={height}
      direction={direction}
      noAnimation={noAnimation ?? false}
      preload={preload}
      className={`
        group @container flex justify-between overflow-hidden
        ${className}
      `}
    />
  )
}
