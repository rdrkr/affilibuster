// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { BlogCard } from '@/components/blog'
import { ButtonLink, Header, Icon } from '@/components/elements'
import { Carousel, PageClient } from '@/components/layout'
import { useLayoutContext } from '@/components/providers'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiBlogBlogDocument,
  type ApiBlogPostBlogPostDocument,
} from '@/lib/generated/types.gen'

import { CardSize, CardSizeModifier } from '@/components/elements/Card'
import { HeaderLevel } from '@/components/elements/Header'

interface BlogClientProps {
  blogPageData: ApiBlogBlogDocument | null
  posts: ApiBlogPostBlogPostDocument[]
}

/**
 * Client component for blog listing page.
 *
 * Renders featured posts carousel and tag-based sections.
 * @param props - Component properties
 * @param props.blogPageData - Blog page metadata from CMS
 * @param props.posts - List of blog posts from CMS
 * @returns Blog listing UI
 */
export default function BlogClient({ blogPageData, posts }: BlogClientProps) {
  const { direction } = useLayoutContext()
  const isRTL = direction === DirectionEnum.RTL

  if (!blogPageData) return null

  const { featuredBlogPosts, tagFilters, pagination, readTimeMinutesLabel, readArticleLabel } = blogPageData
  const itemsPerPage = pagination.itemsPerPage

  const baseBlogCard = {
    direction: direction,
    basePath: '/blog',
    width: 'full' as CardSizeModifier,
    noAnimation: true,
    asLink: true,
    readTimeMinutesLabel: readTimeMinutesLabel,
    readArticleLabel: readArticleLabel,
  }

  const featuredBlogCard = {
    className: 'drop-shadow-xl dark:drop-shadow-xl pb-6 md:pb-0',
    headingLevel: 3 as HeaderLevel,
    height: 'full' as CardSizeModifier,
    showTag: true,
    ...baseBlogCard,
  }

  const mdBlogCard = {
    size: 'md' as CardSize,
    showTag: false,
    ...baseBlogCard,
  }

  const smBlogCard = {
    size: 'sm' as CardSize,
    showTag: false,
    ...baseBlogCard,
  }

  return (
    <PageClient>
      {/* Page Header */}
      <Header data={blogPageData.header} level={1} direction={direction} className="mx-auto max-w-3xl text-center" />

      {featuredBlogPosts?.length && featuredBlogPosts.length > 0 && (
        <>
          {/* Featured Posts Hero Carousel - Desktop */}
          <Carousel variant="hero" direction={direction} className="hidden animate-fade-in-up md:flex md:flex-col">
            {featuredBlogPosts.map((post, index) => (
              <BlogCard
                key={post.documentId}
                post={post}
                size="xl"
                layout="ltr"
                preload={index === 0}
                {...featuredBlogCard}
              />
            ))}
          </Carousel>

          {/* Featured Posts Hero Carousel - Mobile */}
          <Carousel variant="hero" direction={direction} className="flex animate-fade-in-up flex-col md:hidden">
            {featuredBlogPosts.map((post, index) => (
              <BlogCard
                key={`mobile-${post.documentId}`}
                post={post}
                size="md"
                layout="ttb"
                preload={index === 0}
                {...featuredBlogCard}
              />
            ))}
          </Carousel>
        </>
      )}

      {/* Tag Sections or Empty State */}
      {!tagFilters || tagFilters.length === 0 ? (
        /* Empty State using pagination.noItemsFound */
        <div className="py-16 text-center">
          {pagination.noItemsFound.header?.icon && (
            <Icon
              icon={pagination.noItemsFound.header.icon}
              size="6xl"
              className="mb-4 text-neutral-300 dark:text-neutral-600"
            />
          )}
          {pagination.noItemsFound.header && (
            <Header
              data={{
                ...pagination.noItemsFound,
                header: {
                  text: pagination.noItemsFound.header.text,
                  iconPosition: pagination.noItemsFound.header.iconPosition,
                  ariaDescription: pagination.noItemsFound.header.ariaDescription,
                },
              }}
              level={2}
              direction={direction}
            />
          )}
        </div>
      ) : (
        tagFilters.map(tagFilter => {
          const tagName = tagFilter.tag.text
          if (!tagName) return null

          // Filter posts by tag
          const filteredPosts = posts.filter(post => post.tags.some(TAG => TAG.tag.text === tagName))

          if (filteredPosts.length === 0) return null

          // Limit posts per section
          const sectionPosts = filteredPosts.slice(0, itemsPerPage)

          // Split into top/grid
          // Data slicing
          // Mobile: 1 top post, rest in grid
          // Desktop: 2 top posts, rest in grid
          const firstPost = sectionPosts[0]
          const secondPost = sectionPosts[1]
          const remainingPosts = sectionPosts.slice(2)

          return (
            <section key={tagFilter.documentId} className="flex flex-col gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Section Header */}
              <Header
                data={{
                  alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                  promoteHeaderIcon: false,
                  header: {
                    text: tagName,
                    iconPosition: IconPositionEnum.AFTER_TEXT,
                    ariaDescription: tagName,
                  },
                }}
                level={3}
                direction={direction}
              />

              {/* Top Posts Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* First Post - Always visible */}
                {firstPost && <BlogCard post={firstPost} {...mdBlogCard} />}

                {/* Second Post - Hidden on mobile, visible on desktop */}
                {secondPost && <BlogCard post={secondPost} className="hidden md:flex" {...mdBlogCard} />}
              </div>

              {/* Remaining Posts Adaptive Grid */}
              {(secondPost ?? remainingPosts.length > 0) && (
                <>
                  {/* Mobile/Tablet: SM variant (horizontal cards) */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
                    {/* Second Post - Visible on mobile only */}
                    {secondPost && <BlogCard post={secondPost} className="md:hidden" {...smBlogCard} />}

                    {/* Remaining Posts - Visible on mobile only */}
                    {remainingPosts.map(post => (
                      <BlogCard key={post.documentId} post={post} {...smBlogCard} />
                    ))}
                  </div>

                  {/* Desktop: Full variant (vertical cards) - max 4 cols, fills width if fewer */}
                  {remainingPosts.length > 0 && (
                    <div
                      className="hidden gap-6 lg:grid"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(remainingPosts.length, 4).toString()}, 1fr)`,
                      }}
                    >
                      {remainingPosts.map(post => (
                        <BlogCard key={post.documentId} post={post} {...mdBlogCard} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* View All Button */}
              {pagination.nextButton.label && (
                <ButtonLink
                  data={{
                    url: `/blog/tag/${encodeURIComponent(tagName)}`,
                    openInNewTab: pagination.nextButton.openInNewTab,
                    label: {
                      iconPosition: pagination.nextButton.label.iconPosition,
                      text: `${pagination.nextButton.label.text} ${tagName}`,
                      ariaDescription: pagination.nextButton.label.ariaDescription,
                      ...(pagination.nextButton.label.icon ? { icon: pagination.nextButton.label.icon } : {}),
                      ...(pagination.nextButton.label.id ? { id: pagination.nextButton.label.id } : {}),
                    },
                    ...(pagination.nextButton.id ? { id: pagination.nextButton.id } : {}),
                  }}
                  direction={direction}
                  variant="link-1"
                  iconSize="sm"
                  className="self-end"
                />
              )}
            </section>
          )
        })
      )}
    </PageClient>
  )
}
