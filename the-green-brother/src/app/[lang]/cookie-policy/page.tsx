// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getCookiePolicy } from '@/lib/client'
import type { LanguageCode } from '@/lib/generated/types.gen'
import CookiePolicyClient from './CookiePolicyClient'

/**
 * Cookie Policy page server component.
 *
 * Fetches cookie policy content from CMS and passes it to the client component.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered cookie policy page
 */
export default async function CookiePolicyPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  const cookiePolicyData = await getCookiePolicy(lang)

  return <CookiePolicyClient data={cookiePolicyData ?? null} />
}
