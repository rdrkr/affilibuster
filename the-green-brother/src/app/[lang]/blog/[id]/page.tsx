// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getBlogPostById } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

/**
 * Blog post detail page server component.
 *
 * Fetches a single blog post by ID from CMS and passes it to the client component.
 * Returns 404 if post not found.
 * @param params - Route parameters containing language code and post ID
 * @param params.params - Promise containing route parameters with lang and id
 * @returns Server-rendered blog post detail page
 */
export default async function BlogPostPage({ params }: { params: Promise<{ lang: CodeEnum; id: string }> }) {
  const resolvedParams = await params
  const { lang, id } = resolvedParams

  // Fetch blog post by ID
  const post = await getBlogPostById(id, { locale: lang })

  // Return 404 if post not found
  if (!post) {
    notFound()
  }

  return <BlogPostClient post={post} lang={lang} />
}
