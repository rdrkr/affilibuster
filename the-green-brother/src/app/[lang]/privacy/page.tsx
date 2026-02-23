// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getPrivacy } from '@/lib/client'
import { type LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import PrivacyPolicyClient from './PrivacyPolicyClient'

/**
 * Privacy Policy page server component.
 *
 * Fetches privacy policy content from CMS and passes it to the client component.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered privacy policy page
 */
export default async function PrivacyPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  const privacyData = await getPrivacy(lang, { ...draftParams })

  return <PrivacyPolicyClient data={privacyData ?? null} />
}
