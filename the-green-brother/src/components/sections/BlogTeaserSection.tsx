// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Blog Teaser Section Component
 *
 * Renders a horizontal scrollable carousel of blog post previews.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

import { Card, Header, Label } from '@/components/elements'
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
  const { header } = data
  const isRTL = direction === DirectionEnum.RTL

  // Don't render if no blog posts
  if (blogPosts.length === 0) {
    return null
  }

  return (
    <section className="mb-24" aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={2} direction={direction} />

      {/* Horizontal scroll carousel */}
      <div
        className={`
          scrollbar-hide mt-12 flex snap-x snap-mandatory gap-8 overflow-x-auto
        `}
        role="region"
        aria-label={header.header?.ariaDescription ?? ''}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
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
                  headerClassName="line-clamp-2 text-lg leading-snug font-bold text-white transition-colors group-hover:text-primary"
                  subheaderClassName="line-clamp-3 grow text-sm text-text-secondary-dark"
                />
              )}
              <div className={`mt-auto flex items-center text-xs font-bold text-primary`}>
                <Label
                  data={post.readArticleLabel}
                  direction={direction}
                  iconSize="sm"
                  display="inline"
                  className="text-xs font-bold text-primary"
                />
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default BlogTeaserSection
