// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { CookieConsentBanner } from '@/components/consent'
import DraftModeBanner from '@/components/elements/DraftModeBanner'
import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import BackToTopButton from '@/components/navigation/BackToTopButton'
import { LayoutProvider, ThemeProvider } from '@/components/providers'
import { getNavigation } from '@/lib/content/api'
import { productSearchFlag, userProfileFlag } from '@/lib/feature-flags'
import { DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { LanguageCode } from '@/lib/types'
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

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
 * Locale-aware layout providing the full HTML shell with lang/dir attributes,
 * theme support, navigation, footer, and i18n context.
 * @param root0 - Props object with children and params
 * @param root0.children - Child components to render
 * @param root0.params - Promise containing route parameters with lang
 * @returns Full HTML document with navigation, main content, and footer
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

  // Inline script to prevent FOUC by setting theme before React hydrates
  const themeScript = `
    (function() {
      try {
        var stored = localStorage.getItem('theme-preference');
        var theme = stored === 'light' || stored === 'dark' ? stored : null;
        if (!theme && stored !== 'light' && stored !== 'dark') {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body
        className={`
          ${inter.className}
          font-sans transition-colors duration-300
          selection:bg-primary selection:text-black
        `}
      >
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
      </body>
    </html>
  )
}

export default LocaleLayout as unknown as (props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) => Promise<React.ReactElement>
