// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getBlog, getBlogPosts } from '@/lib/client'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import BlogClient from './BlogClient'

/**
 * Blog listing page server component.
 *
 * Fetches blog page metadata and all blog posts from CMS in parallel
 * and passes them to the client component for rendering.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered blog listing page
 */
export default async function BlogPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  const [blogPageData, postsResponse] = await Promise.all([
    getBlog(lang, { ...draftParams }),
    getBlogPosts({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
      ...draftParams,
    }),
  ])

  return <BlogClient blogPageData={blogPageData} posts={postsResponse?.data ?? []} />
}
