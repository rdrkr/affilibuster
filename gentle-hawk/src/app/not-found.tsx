// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { Icon, TextBlock } from '@/components/elements'
import { getError404 } from '@/lib/content'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'

/**
 * Generate noindex metadata for the root 404 page to prevent search engine indexing.
 * @returns Metadata object with noindex robots directive
 */
export const metadata: Metadata = buildNoIndexMetadata({
  title: '404',
})

/**
 * Detect the locale from the request URL pathname.
 * Extracts a two-letter language code from the first path segment
 * and validates it against supported LanguageCode values.
 * @returns The detected LanguageCode, or EN as default
 */
async function detectLocale(): Promise<LanguageCode> {
  try {
    const headersList = await headers()
    const url = headersList.get('x-url') ?? headersList.get('x-invoke-path') ?? ''
    const match = /^\/([a-z]{2})(?:\/|$)/.exec(url)
    if (match) {
      const code = match[1] as LanguageCode
      if (Object.values(LanguageCode).includes(code)) {
        return code
      }
    }
  } catch {
    // Fallback to default
  }
  return LanguageCode.EN
}

/**
 * Root-level 404 Not Found page.
 *
 * Handles 404 errors that occur outside the [lang] segment.
 * Attempts to fetch CMS content for a rich error page.
 * Falls back to a minimal page if CMS is unreachable.
 * @returns 404 page with CMS content if available, or minimal fallback
 */
export default async function RootNotFound(): Promise<React.ReactElement> {
  const locale = await detectLocale()
  const [errorData, languages] = await Promise.all([getError404(locale), getLanguages()])

  const currentLanguage = languages?.find(l => l.code === locale)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  const headerIcon = errorData?.content.header?.header?.icon

  const textBlockData = errorData?.content
    ? {
        ...errorData.content,
        __component: 'elements.text-block' as const,
        ...(errorData.content.header?.header
          ? (() => {
              const { icon: _icon, ...headerWithoutIcon } = errorData.content.header.header
              return {
                header: {
                  ...errorData.content.header,
                  header: headerWithoutIcon,
                },
              }
            })()
          : {}),
      }
    : null

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      {headerIcon && <Icon icon={headerIcon} size="6xl" className="mb-4 text-muted-foreground" />}
      {textBlockData && <TextBlock data={textBlockData} direction={direction} headerLevel={2} />}
      <Link
        href={`/${locale}`}
        className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-foreground transition-colors hover:bg-primary-hover"
      >
        &larr;
      </Link>
    </div>
  )
}
