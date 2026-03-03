// Copyright (c) 2025 Affilibuster by Ronen Druker.

import DraftModeBanner from '@/components/elements/DraftModeBanner'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import { LayoutProvider, ThemeProvider } from '@/components/providers'
import { getNavigation } from '@/lib/content/api'
import { productSearchFlag, userProfileFlag } from '@/lib/feature-flags'
import { DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { LanguageCode } from '@/lib/types'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

/** Lazy-loaded: rendered after scroll, below the fold */
const BackToTopButton = dynamic(() => import('@/components/navigation/BackToTopButton'))
/** Lazy-loaded: consent banner shown on first visit, below the fold */
const CookieConsentBanner = dynamic(() => import('@/components/consent/CookieConsentBanner'))

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: LanguageCode }>
}

/**
 * Generate metadata for the locale layout from navigation data.
 * Sets title template, description, and base OG/Twitter defaults.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title template and site-wide defaults
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const navigation = await getNavigation(lang)

  const siteTitle = navigation?.siteTitle ?? 'TheGreenBrother'
  const siteDescription = navigation?.siteDescription

  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: siteTitle,
    },
    description: siteDescription,
    openGraph: {
      siteName: siteTitle,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

/**
 * Locale-aware layout providing providers, navigation, footer,
 * and i18n context. The HTML shell (html, head, body) is rendered
 * by the root layout at app/layout.tsx.
 * @param root0 - Props object with children and params
 * @param root0.children - Child components to render
 * @param root0.params - Promise containing route parameters with lang
 * @returns Layout content with navigation, main content, and footer
 */
async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params

  // Validate that the incoming `lang` parameter is valid
  if (!Object.values(LanguageCode).includes(lang)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(lang)

  // Check draft mode
  const { isEnabled: isDraft } = await draftMode()

  // Fetch CMS data
  const [messages, navigationData, languages, enableProductSearch, enableUserProfile] = await Promise.all([
    getMessages(),
    getNavigation(lang),
    getLanguages(),
    productSearchFlag(),
    userProfileFlag(),
  ])

  // Find the current language's direction (default to LTR)
  const currentLanguage = languages?.find(l => l.code === lang)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  return (
    <ThemeProvider>
      <NextIntlClientProvider messages={messages}>
        <LayoutProvider lang={lang} direction={direction} navigation={navigationData ?? null}>
          <div className="flex min-h-screen flex-col">
            {isDraft && <DraftModeBanner />}
            <div className="mx-auto w-full max-w-7xl">
              {navigationData && (
                <Navigation
                  data={navigationData}
                  languages={languages ?? []}
                  direction={direction}
                  enableProductSearch={enableProductSearch}
                  enableUserProfile={enableUserProfile}
                />
              )}

              <main className="grow px-4 sm:px-6 lg:px-8">{children}</main>

              <Footer lang={lang} direction={direction} />
            </div>

            <BackToTopButton />
            <CookieConsentBanner lang={lang} direction={direction} />
          </div>
        </LayoutProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}

export default LocaleLayout as unknown as (props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) => Promise<React.ReactElement>
