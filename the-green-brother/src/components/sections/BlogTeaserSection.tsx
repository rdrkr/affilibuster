// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Blog Teaser Section Component
 *
 * Renders a horizontal scrollable carousel of blog post previews.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

import { ButtonLink, Card, Carousel, Header, Label } from '@/components/elements'
import {
  DirectionEnum,
  type ApiBlogPostBlogPostDocument,
  type SectionsBlogTeaserEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the BlogTeaserSection component
 */
export interface BlogTeaserSectionProps {
  /** Blog teaser section data from CMS */
  data: SectionsBlogTeaserEntry & {
    __component: 'sections.blog-teaser'
  }
  /** Blog posts to display (fetched separately from CMS) */
  blogPosts: ApiBlogPostBlogPostDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
}

/**
 * Blog teaser section with horizontal scrollable carousel.
 * @param props - Component props with CMS section data and blog posts
 * @param props.data - Blog teaser section data from CMS
 * @param props.blogPosts - Blog posts to display
 * @param props.direction - Language direction for RTL support
 * @returns Blog teaser section component or null if no blog posts
 */
export function BlogTeaserSection({ data, blogPosts, direction }: BlogTeaserSectionProps) {
  const { header, viewAllButton } = data
  const isRTL = direction === DirectionEnum.RTL

  // Don't render if no blog posts
  if (blogPosts.length === 0) {
    return null
  }

  return (
    <section className="mb-24 flex flex-col" aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={2} direction={direction} />
      <ButtonLink
        data={viewAllButton}
        direction={direction}
        variant="link-1"
        iconSize="sm"
        className={`mt-4 ${isRTL ? 'self-start' : 'self-end'}`}
      />

      {/* Horizontal scroll carousel */}
      <Carousel direction={direction} ariaLabel={header.header?.ariaDescription ?? ''} className="mt-2">
        {blogPosts.map(post => {
          const { featuredImage } = post
          const firstTag = post.tags?.[0]?.tag?.text ?? ''

          return (
            <Card
              key={post.documentId}
              href={`/blog/${post.slug}`}
              image={featuredImage}
              imageAlt={post.content?.header?.header?.text ?? ''}
              tag={firstTag}
              variant="blog"
            >
              {post.content?.header && (
                <Header
                  data={post.content.header}
                  level={4}
                  direction={direction}
                  className="mb-3"
                  headerClassName={`
                    line-clamp-2 text-lg leading-snug font-bold
                    text-neutral-800 transition-colors group-hover:text-primary group-hover:text-shadow-sm
                    dark:text-white dark:group-hover:text-shadow-none
                  `}
                  subheaderClassName="line-clamp-3 grow text-sm text-neutral-600 dark:text-text-secondary-dark"
                />
              )}
              <div
                className={`
                  mt-auto flex items-center text-xs font-bold
                  text-primary text-shadow-sm dark:text-shadow-none
                `}
              >
                <Label
                  data={post.readArticleLabel}
                  direction={direction}
                  iconSize="sm"
                  display="inline"
                  className="text-xs font-bold text-primary text-shadow-sm dark:text-shadow-none"
                />
              </div>
            </Card>
          )
        })}
      </Carousel>
    </section>
  )
}

export default BlogTeaserSection
