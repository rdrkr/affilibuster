// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root-level 404 Not Found Page
 * Handles 404s for paths that don't include a language code
 * Renders a basic 404 page in the default language
 */

import { Button } from '@/components/Button'
import { Navigation } from '@/components/Navigation'
import { AuthProvider } from '@/lib/auth'
import { getError404, getNavigation } from '@/lib/client'
import { DEFAULT_LANGUAGE_CODE } from '@/lib/types'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Link from 'next/link'

// Note: Next.js does NOT support generateMetadata in not-found.tsx files
// Metadata must be set via the layout or page that calls notFound()

export default async function RootNotFound() {
  // Get messages for next-intl provider (required for client components like CurrencySelector)
  const messages = await getMessages()

  let errorData = null
  let navigationData = null

  try {
    errorData = await getError404(DEFAULT_LANGUAGE_CODE)
  } catch (error) {
    console.error('Failed to fetch 404 error page:', error)
  }

  try {
    navigationData = await getNavigation(DEFAULT_LANGUAGE_CODE)
  } catch (error) {
    console.error('Failed to fetch navigation:', error)
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation data={navigationData} lang={DEFAULT_LANGUAGE_CODE} />
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
                <Link href={`/${DEFAULT_LANGUAGE_CODE}`} data-testid="404-home-link">
                  <Button variant="primary" className="w-full bg-gradient-to-r from-primary-600 to-secondary-600">
                    {errorData?.ctaText ?? 'Back to Homepage'}
                  </Button>
                </Link>

                {errorData?.secondaryCtaText && (
                  <Link href={`/${DEFAULT_LANGUAGE_CODE}/products`}>
                    <Button variant="ghost" className="w-full">
                      {errorData.secondaryCtaText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
