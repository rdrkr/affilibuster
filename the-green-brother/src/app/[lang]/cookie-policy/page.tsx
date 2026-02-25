// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getCookiePolicy, getNavigation } from '@/lib/client'
import { type LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import CookiePolicyClient from './CookiePolicyClient'

/**
 * Generate SEO metadata for the cookie policy page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const [pageData, navigation] = await Promise.all([getCookiePolicy(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: pageData?.seoMetadata,
    lang,
    path: '/cookie-policy',
    siteName: navigation?.siteTitle,
  })
}

/**
 * Cookie Policy page server component.
 *
 * Fetches cookie policy content from CMS and passes it to the client component.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered cookie policy page
 */
export default async function CookiePolicyPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  const cookiePolicyData = await getCookiePolicy(lang, { ...draftParams })

  return <CookiePolicyClient data={cookiePolicyData ?? null} />
}
