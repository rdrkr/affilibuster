// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getPrivacy } from '@/lib/client'
import type { LanguageCode } from '@/lib/generated/types.gen'
import PrivacyPolicyClient from './PrivacyPolicyClient'

/**
 * Privacy Policy page server component.
 *
 * Fetches privacy policy content from CMS and passes it to the client component.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered privacy policy page
 */
export default async function PrivacyPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  const privacyData = await getPrivacy(lang)

  return <PrivacyPolicyClient data={privacyData ?? null} />
}
