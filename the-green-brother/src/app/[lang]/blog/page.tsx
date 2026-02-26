// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { JsonLdScript } from '@/components/seo'
import { getBlog, getBlogPosts, getNavigation } from '@/lib/client'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildBreadcrumbJsonLd, buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import BlogClient from './BlogClient'

/**
 * Generate SEO metadata for the blog listing page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const [pageData, navigation] = await Promise.all([getBlog(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: pageData?.seoMetadata,
    lang,
    path: '/blog',
    siteName: navigation?.siteTitle,
  })
}

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

  const breadcrumbs = [{ name: 'Home', path: '' }, { name: blogPageData?.header.header?.text ?? 'Blog' }]

  return (
    <>
      <JsonLdScript data={buildBreadcrumbJsonLd(breadcrumbs, lang)} />
      <BlogClient blogPageData={blogPageData} posts={postsResponse?.data ?? []} />
    </>
  )
}
