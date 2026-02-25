// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getBlog, getBlogPosts, getNavigation } from '@/lib/client'
import { type BlogPostGetBlogPostsData, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import TopicClient from './TopicClient'

/**
 * Generate static params for all blog tags across all languages.
 * Extracts unique tags from all blog posts and generates params for each lang x tag combination.
 * @returns Array of { lang, tag } param objects for static generation
 */
export async function generateStaticParams(): Promise<{ lang: string; tag: string }[]> {
  const response = await getBlogPosts({ pagination: { page: 1, pageSize: 100 } })
  if (!response?.data) return []
  const uniqueTags = new Set<string>()
  for (const post of response.data) {
    for (const tagEntry of post.tags) {
      if (tagEntry.tag.text) {
        uniqueTags.add(tagEntry.tag.text)
      }
    }
  }
  return SUPPORTED_LANGUAGE_CODES.flatMap(lang =>
    Array.from(uniqueTags).map(tag => ({ lang, tag: encodeURIComponent(tag) }))
  )
}

/**
 * Generate SEO metadata for a blog tag page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang and tag
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: LanguageCode; tag: string }>
}): Promise<Metadata> {
  const { lang, tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const [blogData, navigation] = await Promise.all([getBlog(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: blogData?.seoMetadata
      ? {
          ...blogData.seoMetadata,
          metaTitle: blogData.seoMetadata.metaTitle ? `${decodedTag} - ${blogData.seoMetadata.metaTitle}` : decodedTag,
        }
      : { metaTitle: decodedTag },
    lang,
    path: `/blog/tag/${tag}`,
    siteName: navigation?.siteTitle,
  })
}

/**
 * Tag detail page server component.
 *
 * Fetches blog posts filtered by tag from CMS and passes them to the client component.
 * When draft mode is enabled, fetches draft content for preview.
 * @param props - Route props
 * @param props.params - Promise containing route parameters with lang and tag
 * @returns Server-rendered tag detail page
 */
export default async function TopicPage({ params }: { params: Promise<{ lang: LanguageCode; tag: string }> }) {
  const resolvedParams = await params
  const { lang, tag } = resolvedParams
  const decodedTag = decodeURIComponent(tag)
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  // Fetch posts filtered by tag, blog page data (for noItemsFound) in parallel
  const [postsResponse, blogPageResponse] = await Promise.all([
    getBlogPosts({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
      ...draftParams,
      filters: {
        tags: {
          tag: {
            text: {
              $eq: decodedTag,
            },
          },
        },
      } as unknown as NonNullable<BlogPostGetBlogPostsData['query']['filters']>,
    }),
    getBlog(lang, { ...draftParams }),
  ])

  if (!blogPageResponse) return null

  return (
    <TopicClient
      tag={decodedTag}
      posts={postsResponse?.data ?? []}
      noItemsFound={blogPageResponse.pagination.noItemsFound}
      readTimeMinutesLabel={blogPageResponse.readTimeMinutesLabel}
      readArticleLabel={blogPageResponse.readArticleLabel}
    />
  )
}
