// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getTerm } from '@/lib/client'
import type { CodeEnum } from '@/lib/generated/types.gen'
import TermsOfServiceClient from './TermsOfServiceClient'

/**
 * Terms of Service page server component.
 *
 * Fetches terms of service content from CMS and passes it to the client component.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered terms of service page
 */
export default async function TermsPage({ params }: { params: Promise<{ lang: CodeEnum }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  const termData = await getTerm(lang)

  return <TermsOfServiceClient data={termData ?? null} />
}
