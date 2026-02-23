// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getBlog, getBlogPostBySlug, getLanguages, getNavigation } from '@/lib/client'
import { DirectionEnum, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

/**
 * Blog post detail page server component.
 *
 * Fetches a single blog post by Slug from CMS and passes it to the client component.
 * Returns 404 if post not found.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code and post slug
 * @param params.params - Promise containing route parameters with lang and slug
 * @returns Server-rendered blog post detail page
 */
export default async function BlogPostPage({ params }: { params: Promise<{ lang: LanguageCode; slug: string }> }) {
  const resolvedParams = await params
  const { lang, slug } = resolvedParams
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  // Fetch blog post by Slug, languages, navigation, and blog settings
  const [post, languages, navigation, blogData] = await Promise.all([
    getBlogPostBySlug(slug, { locale: lang, ...draftParams }),
    getLanguages(),
    getNavigation(lang),
    getBlog(lang, { ...draftParams }),
  ])

  // Get current language direction
  const currentLanguage = languages?.find(l => l.code === lang)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  // Return 404 if post or navigation not found
  if (!post || !navigation || !blogData) {
    notFound()
  }

  return <BlogPostClient post={post} direction={direction} blogData={blogData} language={lang} />
}
