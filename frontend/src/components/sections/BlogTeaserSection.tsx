// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Blog Teaser Section Component
 *
 * Renders a horizontal scrollable carousel of blog post previews.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

import { BlogCard } from '@/components/blog'
import { ButtonLink, Header } from '@/components/elements'
import { Carousel } from '@/components/layout'
import { DirectionEnum, type ElementsLabelEntry, type SectionsBlogTeaserEntry } from '@/lib/generated/types.gen'

/**
 * Props for the BlogTeaserSection component
 */
export interface BlogTeaserSectionProps {
  /** Blog teaser section data from CMS */
  data: SectionsBlogTeaserEntry & {
    __component: 'sections.blog-teaser'
  }
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Read time minutes label */
  readTimeMinutesLabel: ElementsLabelEntry
  /** Read article label */
  readArticleLabel: ElementsLabelEntry
}

/**
 * Blog teaser section with horizontal scrollable carousel.
 * @param props - Component props with CMS section data and blog posts
 * @param props.data - Blog teaser section data from CMS
 * @param props.direction - Language direction for RTL support
 * @param props.readTimeMinutesLabel - Read time minutes label
 * @param props.readArticleLabel - Read article label
 * @returns Blog teaser section component or null if no blog posts
 */
export function BlogTeaserSection({ data, direction, readTimeMinutesLabel, readArticleLabel }: BlogTeaserSectionProps) {
  const { header, blogPosts, viewAllButton } = data
  const isRTL = direction === DirectionEnum.RTL

  // Don't render if no blog posts
  if (blogPosts.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col" dir={isRTL ? 'rtl' : 'ltr'} aria-label={header.header?.ariaDescription ?? ''}>
      <Header data={header} level={2} direction={direction} />
      <ButtonLink
        data={viewAllButton}
        direction={direction}
        variant="link-1"
        iconSize="sm"
        className={`mt-4 self-end`}
      />

      <Carousel direction={direction} ariaLabel={header.header?.ariaDescription ?? ''} className="mt-2">
        {blogPosts.map(post => (
          <BlogCard
            key={post.documentId}
            post={post}
            direction={direction}
            readTimeMinutesLabel={readTimeMinutesLabel}
            readArticleLabel={readArticleLabel}
            asLink={true}
          />
        ))}
      </Carousel>
    </section>
  )
}

export default BlogTeaserSection
