// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getBlog, getBlogPosts } from '@/lib/client'
import { type BlogPostGetBlogPostsData, CodeEnum } from '@/lib/generated/types.gen'
import TopicClient from './TopicClient'

/**
 * Tag detail page server component.
 *
 * Fetches blog posts filtered by tag from CMS and passes them to the client component.
 * @param props - Route props
 * @param props.params - Promise containing route parameters with lang and tag
 * @returns Server-rendered tag detail page
 */
export default async function TopicPage({ params }: { params: Promise<{ lang: CodeEnum; tag: string }> }) {
  const resolvedParams = await params
  const { lang, tag } = resolvedParams
  const decodedTag = decodeURIComponent(tag)

  // Fetch posts filtered by tag, blog page data (for noItemsFound) in parallel
  const [postsResponse, blogPageResponse] = await Promise.all([
    getBlogPosts({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
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
    getBlog(lang),
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
