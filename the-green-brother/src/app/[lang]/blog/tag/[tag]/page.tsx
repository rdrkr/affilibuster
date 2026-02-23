// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getBlog, getBlogPosts } from '@/lib/client'
import { type BlogPostGetBlogPostsData, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import TopicClient from './TopicClient'

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
