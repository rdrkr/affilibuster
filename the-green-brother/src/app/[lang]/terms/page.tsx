// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getTerm } from '@/lib/client'
import { type LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import TermsOfServiceClient from './TermsOfServiceClient'

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
