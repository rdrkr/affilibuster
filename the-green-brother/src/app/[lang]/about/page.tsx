// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getAbout } from '@/lib/client'
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import AboutClient from './AboutClient'

/**
 * About page server component.
 *
 * Fetches about page content from CMS and passes it to the client component.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered about page
 */
export default async function AboutPage({ params }: { params: Promise<{ lang: CodeEnum }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  // Fetch about page content and languages in parallel
  const [aboutData, languages] = await Promise.all([getAbout(lang), getLanguages()])

  // Find the current language's direction (default to LTR)
  const currentLanguage = languages?.find(l => l.code === lang)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  return <AboutClient aboutData={aboutData} direction={direction} />
}
