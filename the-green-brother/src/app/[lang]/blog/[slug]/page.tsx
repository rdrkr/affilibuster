// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getBlog, getBlogPostBySlug, getBlogPosts, getLanguages, getNavigation } from '@/lib/client'
import { DirectionEnum, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'

/**
 * Generate static params for all blog post slugs across all languages.
 * @returns Array of { lang, slug } param objects for static generation
 */
export async function generateStaticParams(): Promise<{ lang: string; slug: string }[]> {
  const response = await getBlogPosts({ pagination: { page: 1, pageSize: 100 } })
  if (!response?.data) return []
  return SUPPORTED_LANGUAGE_CODES.flatMap(lang => response.data.map(post => ({ lang, slug: post.slug })))
}

/**
 * Generate SEO metadata for a blog post detail page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang and slug
 * @returns Metadata object with title, description, OG (article type), Twitter, and alternates
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: LanguageCode; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const [post, navigation] = await Promise.all([getBlogPostBySlug(slug, { locale: lang }), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: post?.seoMetadata,
    lang,
    path: `/blog/${slug}`,
    siteName: navigation?.siteTitle,
    ogType: 'article',
    ogImageUrl: post?.wideImage.url ?? post?.squareImage.url,
  })
}

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
