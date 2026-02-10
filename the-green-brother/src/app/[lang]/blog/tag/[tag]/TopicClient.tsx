// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import type { CardLayout, CardSize, CardSizeModifier } from '@/components/elements/Card'

import { BlogCard } from '@/components/blog'
import { Header, Text } from '@/components/elements'
import { HeaderLevel } from '@/components/elements/Header'
import { PageClient } from '@/components/layout'
import { useLayoutContext } from '@/components/providers'
import {
  AlignmentEnum,
  IconPositionEnum,
  type ApiBlogPostBlogPostDocument,
  type ElementsHeaderEntry,
  type ElementsLabelEntry,
} from '@/lib/generated/types.gen'

interface TopicClientProps {
  tag: string
  posts: ApiBlogPostBlogPostDocument[]
  noItemsFound?: ElementsHeaderEntry | undefined

  readTimeMinutesLabel: ElementsLabelEntry
  readArticleLabel: ElementsLabelEntry
}

/**
 * Client component for tag detail page.
 *
 * Renders a grid of blog posts filtered by a specific tag.
 * @param props - Component properties
 * @param props.tag - The tag name being filtered by
 * @param props.posts - List of blog posts matching the tag
 * @param props.noItemsFound - CMS data for "No items found" state
 * @param props.readTimeMinutesLabel - Label for read time
 * @param props.readArticleLabel - Label for read article
 * @returns Topic detail UI
 */
export default function TopicClient({
  tag,
  posts,
  noItemsFound,
  readTimeMinutesLabel,
  readArticleLabel,
}: TopicClientProps) {
  const { direction } = useLayoutContext()

  // Header data for the tag title
  const headerData = {
    header: {
      text: decodeURIComponent(tag), // Handle URL encoded tags
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: `Blog posts tagged with ${tag}`,
    },
    alignment: AlignmentEnum.LANGUAGE_DIRECTION,
    promoteHeaderIcon: false,
  }

  const cardProps = {
    direction: direction,
    headingLevel: 6 as HeaderLevel,
    basePath: `/blog`,
    size: 'sm' as CardSize,
    width: 'full' as CardSizeModifier,
    showTag: false,
    noAnimation: true,
    asLink: true,
    readTimeMinutesLabel: readTimeMinutesLabel,
    readArticleLabel: readArticleLabel,
    layout: 'rtl' as CardLayout,
  }

  return (
    <PageClient
      className="px-4"
      childrenClassName="gap-8!"
      breadcrumbs={{
        customLastCrumbLabel: <Text text={headerData.header.text} />,
      }}
    >
      <Header data={headerData} level={2} direction={direction} />

      {posts.length > 0 ? (
        <>
          {/* Mobile/Tablet: SM variant (horizontal cards) */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:hidden">
            {posts.map(post => (
              <BlogCard key={post.documentId} post={post} {...cardProps} />
            ))}
          </div>

          {/* Desktop: Full variant (vertical cards) - max 4 cols, fills width if fewer */}
          <div
            className="hidden gap-8 lg:grid"
            style={{
              gridTemplateColumns: `repeat(${Math.min(posts.length, 4).toString()}, 1fr)`,
            }}
          >
            {posts.map(post => (
              <BlogCard key={post.documentId} post={post} {...cardProps} />
            ))}
          </div>
        </>
      ) : (
        noItemsFound && (
          <div className="container">
            <Header data={noItemsFound} level={3} direction={direction} />
          </div>
        )
      )}
    </PageClient>
  )
}
