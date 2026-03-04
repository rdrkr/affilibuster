// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { Icon, TextBlock } from '@/components/elements'
import { getError404 } from '@/lib/content'
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
 * Renders a big icon on top (extracted from header), then uses TextBlock
 * for the header text, subheader, and markdown content — with the icon
 * stripped from the header data to avoid duplication.
 * If CMS content is unavailable, renders nothing (per No Fallback Strings principle).
 * @returns 404 error page with CMS content, or minimal fallback
 */
export default async function NotFoundPage(): Promise<React.ReactElement> {
  const locale = (await getLocale()) as LanguageCode
  const [errorData, languages] = await Promise.all([getError404(locale), getLanguages()])

  const currentLanguage = languages?.find(l => l.code === locale)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  // Extract icon from header to render as a big standalone icon on top
  const headerIcon = errorData?.content.header?.header?.icon

  // Build TextBlock data with icon stripped from header to avoid duplication
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
