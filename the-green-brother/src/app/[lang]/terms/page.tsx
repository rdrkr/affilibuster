// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getNavigation, getTerm } from '@/lib/client'
import { type LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import TermsOfServiceClient from './TermsOfServiceClient'

/**
 * Generate SEO metadata for the terms of service page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const [pageData, navigation] = await Promise.all([getTerm(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: pageData?.seoMetadata,
    lang,
    path: '/terms',
    siteName: navigation?.siteTitle,
  })
}

/**
 * Terms of Service page server component.
 *
 * Fetches terms of service content from CMS and passes it to the client component.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered terms of service page
 */
export default async function TermsPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  const termData = await getTerm(lang, { ...draftParams })

  return <TermsOfServiceClient data={termData ?? null} />
}
