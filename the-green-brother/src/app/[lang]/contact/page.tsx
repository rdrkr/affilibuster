// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getContactUs } from '@/lib/client'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import ContactClient from './ContactClient'

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
