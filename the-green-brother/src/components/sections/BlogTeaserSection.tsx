// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Blog Teaser Section Component
 *
 * Renders a horizontal scrollable carousel of blog post previews.
 * All content comes from CMS - no hardcoded strings.
 * Uses Header composite for section title.
 */

'use client'

import Link from 'next/link'

import { CMSIcon, CMSImage, CMSText, Header } from '@/components/elements'
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
      <Header
        data={header}
        level={2}
        className="mb-12"
        headerClassName="text-3xl text-white"
        subheaderClassName="mx-auto max-w-2xl text-lg text-text-secondary-dark"
        direction={direction}
      />

      {/* Horizontal scroll carousel */}
      <div
        className={`
          scrollbar-hide flex snap-x snap-mandatory gap-8 overflow-x-auto
        `}
        role="region"
        aria-label={header.header?.ariaDescription ?? ''}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {blogPosts.map(post => {
          const { featuredImage } = post
          const firstTag = post.tags?.[0]

          return (
            <Link
              key={post.documentId}
              href={`/blog/${post.slug}`}
              className={`
                group isolate flex h-card w-blog-carousel-mobile shrink-0 snap-start
                flex-col overflow-hidden rounded-xl border
                border-white/5 bg-surface-dark transition-all
                hover:-translate-y-1 hover:border-primary/30
                md:w-blog-carousel-desktop
              `}
            >
              <div className="relative h-48 overflow-hidden bg-tertiary-800">
                <CMSImage
                  image={featuredImage}
                  fallbackAlt={post.content?.header?.header?.text ?? ''}
                  className={`
                    object-cover transition-transform duration-500
                    group-hover:scale-110
                  `}
                  fill
                  sizes="(max-width: 768px) 85vw, calc((100vw - 4rem) / 3.5)"
                />
              </div>
              <div className="flex grow flex-col p-6">
                {firstTag?.tag && (
                  <span
                    className={`
                    mb-2 text-xs font-bold tracking-wider text-primary uppercase
                  `}
                  >
                    <CMSText text={firstTag.tag.text} />
                  </span>
                )}
                {post.content?.header?.header && (
                  <h3
                    className={`
                      mb-3 line-clamp-2 text-lg leading-snug font-bold
                      text-white transition-colors
                      group-hover:text-primary
                    `}
                  >
                    <CMSText text={post.content.header.header.text} />
                  </h3>
                )}
                {post.content?.header?.subheader?.text && (
                  <p
                    className={`
                    mb-4 line-clamp-3 grow text-sm text-text-secondary-dark
                  `}
                  >
                    <CMSText text={post.content.header.subheader.text} />
                  </p>
                )}
                <div
                  className={`
                    mt-auto flex items-center text-xs font-bold text-primary
                    ${isRTL ? 'flex-row-reverse' : ''}
                  `}
                >
                  <CMSText text={post.readArticleLabel.text} />
                  <CMSIcon
                    icon={post.readArticleLabel.icon ?? 'arrow_forward'}
                    size="sm"
                    className={isRTL ? 'mr-1' : 'ml-1'}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default BlogTeaserSection
