// Copyright (c) 2025 Affilibuster by Ronen Druker.

import Footer from '@/components/footer'
import Navigation from '@/components/navigation'
import BackToTopButton from '@/components/navigation/BackToTopButton'
import { getNavigation } from '@/lib/content/api'
import { productSearchFlag, userProfileFlag } from '@/lib/feature-flags'
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { LanguageCode } from '@/lib/types'
import '@/styles/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

interface Props {
  children: React.ReactNode
  params: Promise<{ lang: CodeEnum }>
}

/**
 * Locale-aware layout providing navigation, footer, and i18n context.
 * @param root0 - Props object with children and params
 * @param root0.children - Child components to render
 * @param root0.params - Promise containing route parameters with lang
 * @returns Layout with navigation, main content, and footer
 */
async function LocaleLayout({ children, params }: Props) {
  const { lang } = await params

  // Validate that the incoming `lang` parameter is valid
  if (!Object.values(LanguageCode).includes(lang)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(lang)

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
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
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

          <main
            className={`
            grow px-4
            sm:px-6
            lg:px-8
          `}
          >
            {children}
          </main>
          <Footer lang={lang} direction={direction} />
        </div>
        <BackToTopButton direction={direction} />
      </div>
    </NextIntlClientProvider>
  )
}

export default LocaleLayout as unknown as (props: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) => Promise<React.ReactElement>
