// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getCookiePolicy } from '@/lib/client'
import { type LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import CookiePolicyClient from './CookiePolicyClient'

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
