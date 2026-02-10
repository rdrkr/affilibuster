// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getContactUs } from '@/lib/client'
import { LanguageCode } from '@/lib/generated/types.gen'
import ContactClient from './ContactClient'

/**
 * Contact page server component.
 *
 * Fetches contact page content from CMS and passes it to the client component.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered contact page
 */
export default async function ContactPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  // Fetch contact page content
  const contactData = await getContactUs(lang)

  return <ContactClient contactData={contactData} />
}
