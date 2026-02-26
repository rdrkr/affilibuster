// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { getError404 } from '@/lib/content'
import { TextBlock } from '@/components/elements'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'

/**
 * Generate noindex metadata for the 404 page to prevent search engine indexing.
 * @returns Metadata object with noindex robots directive
 */
export const metadata: Metadata = buildNoIndexMetadata({
  title: '404',
})

/**
 * Custom 404 Not Found page server component.
 *
 * Fetches localized error content from CMS via backend API.
 * Renders a centered message with a link back to the homepage.
 * If CMS content is unavailable, renders nothing (per No Fallback Strings principle).
 * @returns 404 error page with CMS content, or minimal fallback
 */
export default async function NotFoundPage(): Promise<React.ReactElement> {
  const locale = (await getLocale()) as LanguageCode
  const [errorData, languages] = await Promise.all([getError404(locale), getLanguages()])

  const currentLanguage = languages?.find(l => l.code === locale)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      {errorData?.content && (
        <TextBlock data={{ ...errorData.content, __component: 'elements.text-block' as const }} direction={direction} />
      )}
      <Link
        href={`/${locale}`}
        className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
      >
        &larr;
      </Link>
    </div>
  )
}
