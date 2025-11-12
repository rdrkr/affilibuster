// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * 404 Not Found Page (Language-specific)
 * Displayed when a page is not found in the requested language
 * Fetches content from Strapi error-404 single type with language fallback
 */

import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'
import { AuthProvider } from '@/lib/auth'
import { getError404, getNavigation } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Link from 'next/link'

interface Props {
  params?: Promise<{ lang: string }>
}

// Static metadata for 404 page
// Note: generateMetadata is not supported in not-found.tsx
// Ref: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  robots: 'noindex, nofollow',
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

  // Get messages for next-intl provider (required for client components like CurrencySelector)
  const messages = await getMessages()

  let errorData = null
  let navigationData = null

  try {
    // Try to fetch error-404 content from Strapi with language fallback
    errorData = await getError404(lang)
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
  }

  try {
    navigationData = await getNavigation(lang)
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation data={navigationData} lang={lang} />
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 px-4">
            <div className="max-w-md w-full text-center" data-testid="404-page">
              <div className="mb-8">
                <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-4">
                  404
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                  {errorData?.title ?? 'Page Not Found'}
                </h1>
                {errorData?.subtitle && (
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">{errorData.subtitle}</p>
                )}
                <p className="text-neutral-600 dark:text-neutral-400">
                  {errorData?.message ?? "The page you're looking for doesn't exist."}
                </p>
              </div>

              <div className="space-y-4">
                <Link href={`/${lang}`} data-testid="404-home-link">
                  <Button variant="primary" className="w-full bg-gradient-to-r from-primary-600 to-secondary-600">
                    {errorData?.ctaText ?? 'Back to Homepage'}
                  </Button>
                </Link>

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
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
