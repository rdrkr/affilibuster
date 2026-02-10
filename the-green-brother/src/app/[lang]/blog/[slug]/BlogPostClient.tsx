// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { ContributorCard, Header, Text, TextBlock } from '@/components/elements'
import { PageClient } from '@/components/layout'
import { HeroSection } from '@/components/sections/HeroSection'

import {
  AlignmentEnum,
  LanguageCode,
  DirectionEnum,
  IconPositionEnum,
  SectionsHeroEntry,
  VariantEnum,
  type ApiBlogBlogDocument,
  type ApiBlogPostBlogPostDocument,
} from '@/lib/generated/types.gen'

/**
 * Props for the BlogPostClient component.
 * @param post - Blog post document
 * @param blogData - Blog data document
 * @param direction - Language direction
 * @param language - Language code
 */
interface BlogPostClientProps {
  post: ApiBlogPostBlogPostDocument
  blogData: ApiBlogBlogDocument
  direction: DirectionEnum
  language: LanguageCode
}

/**
 * Client component for rendering a single blog post.
 * @param root0 - Component props
 * @param root0.post - Blog post document
 * @param root0.blogData - Blog data document
 * @param root0.direction - Language direction
 * @param root0.language - Language code
 * @returns Rendered blog post page
 */
export default function BlogPostClient({ post, direction, blogData, language }: BlogPostClientProps) {
  // Format published date
  const publishedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const postHeader = post.content.header?.header
  const postSubheader = post.content.header?.subheader

  const heroSection: SectionsHeroEntry & {
    __component: 'sections.hero'
  } = {
    id: 0,
    __component: 'sections.hero',
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
      header: {
        text: postHeader?.text ?? '',
        iconPosition: postHeader?.iconPosition ?? IconPositionEnum.BEFORE_TEXT,
        ariaDescription: postHeader?.ariaDescription ?? '',
      },
    },
    image: post.featuredImage,
    variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
  }

  return (
    <PageClient
      layout="narrow"
      breadcrumbs={{
        customLastCrumbLabel: <Text text={postHeader?.text ?? ''} />,
      }}
    >
      <HeroSection
        key="post-hero"
        direction={direction}
        data={heroSection}
        header={
          post.tags[0] ? (
            <Text
              text={post.tags[0].tag.text}
              as="span"
              className={`
                mb-4 block text-sm font-bold tracking-wider text-primary-500
                uppercase
              `}
            />
          ) : null
        }
        footer={
          <div className="flex items-center gap-4 text-sm font-medium text-neutral-500 dark:text-tertiary-400">
            <ContributorCard
              member={post.author}
              direction={direction}
              size="xs"
              layout="ltr"
              width="fit"
              height="fit"
              className="max-w-full shrink!"
            />
            {publishedDate && (
              <>
                <span>•</span>
                <span>{publishedDate}</span>
              </>
            )}
            <>
              <span>•</span>
              <span>
                {String(post.readTimeInMinutes)} {blogData.readTimeMinutesLabel.text}
              </span>
            </>
          </div>
        }
      />

      {/* Article Content */}
      {post.content.content && (
        <TextBlock
          direction={direction}
          data={{
            __component: 'elements.text-block',
            content: post.content.content,
            ...(postSubheader && {
              header: {
                alignment: AlignmentEnum.LANGUAGE_DIRECTION,
                promoteHeaderIcon: false,
                subheader: postSubheader,
              },
            }),
          }}
        />
      )}

      {/* Author Bio (if available) */}
      {post.author.bio && (
        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-8 dark:border-tertiary-700">
          <Header data={blogData.aboutAuthorHeader} direction={direction} level={3} />
          <ContributorCard
            member={post.author}
            direction={direction}
            size="sm"
            layout="ltr"
            width="full"
            height="fit"
          />
        </div>
      )}
    </PageClient>
  )
}
