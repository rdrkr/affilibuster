// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getContactUs, getNavigation } from '@/lib/client'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import ContactClient from './ContactClient'

/**
 * Generate SEO metadata for the contact page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const [pageData, navigation] = await Promise.all([getContactUs(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: pageData?.seoMetadata,
    lang,
    path: '/contact',
    siteName: navigation?.siteTitle,
  })
}

/**
 * Contact page server component.
 *
 * Fetches contact page content from CMS and passes it to the client component.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered contact page
 */
export default async function ContactPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  // Fetch contact page content
  const contactData = await getContactUs(lang, { ...draftParams })

  return <ContactClient contactData={contactData} />
}
