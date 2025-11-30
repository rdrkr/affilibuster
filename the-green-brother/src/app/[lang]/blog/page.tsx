// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getBlog, getBlogPosts } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import BlogClient from './BlogClient'

/**
 * Blog listing page server component.
 *
 * Fetches blog page metadata and all blog posts from CMS in parallel
 * and passes them to the client component for rendering.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered blog listing page
 */
export default async function BlogPage({ params }: { params: Promise<{ lang: CodeEnum }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  // Fetch blog page data and posts in parallel
  const [blogPageData, postsResponse] = await Promise.all([
    getBlog(lang),
    getBlogPosts({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
    }),
  ])

  return <BlogClient blogPageData={blogPageData} posts={postsResponse?.data ?? []} lang={lang} />
}
