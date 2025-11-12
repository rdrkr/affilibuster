// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * 404 Not Found Page (Language-specific)
 * Displayed when a page is not found in the requested language
 * Fetches content from Strapi error-404 single type with language fallback
 */

import Link from 'next/link'
import { getError404 } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { Button } from '@/components/Button'

interface Props {
  params?: Promise<{ lang: string }>
}

export default async function NotFoundPage({ params }: Props) {
  let lang: CodeEnum = CodeEnum.EN
  try {
    if (params) {
      const resolvedParams = await params
      if (resolvedParams.lang) {
        lang = resolvedParams.lang as CodeEnum
      }
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  let errorData = null
  try {
    // Try to fetch error-404 content from Strapi with language fallback
    errorData = await getError404(lang)
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-4">
            404
          </div>
          {errorData?.title && (
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">{errorData.title}</h1>
          )}
          {errorData?.subtitle && (
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">{errorData.subtitle}</p>
          )}
          {errorData?.message && <p className="text-neutral-600 dark:text-neutral-400">{errorData.message}</p>}
        </div>

        <div className="space-y-4">
          {errorData?.ctaText && (
            <Link href={`/${lang}`}>
              <Button variant="primary" className="w-full bg-gradient-to-r from-primary-600 to-secondary-600">
                {errorData.ctaText}
              </Button>
            </Link>
          )}

          {errorData?.secondaryCtaText && (
            <Link href={`/${lang}/products`}>
              <Button variant="ghost" className="w-full">
                {errorData.secondaryCtaText}
              </Button>
            </Link>
          )}

          {errorData?.content && (
            <div
              className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: errorData.content }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
