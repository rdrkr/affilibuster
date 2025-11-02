// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language-specific Layout
 * Reference: T125 (Create [lang] dynamic segment layout)
 */

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import Script from 'next/script'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { LocaleProvider } from '@/components/LocaleProvider'
import { getNavigation, getFooter } from '@/lib/client'
import '../globals.css'

const locales = ['en', 'it', 'he']

type Props = {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return locales.map(lang => ({ lang }))
}

export default async function LocaleLayout({ children, params }: Props) {
  let lang = 'en'
  try {
    const resolvedParams = await params
    if (resolvedParams?.lang) {
      lang = resolvedParams.lang
    }
  } catch (e) {
    console.error('Failed to resolve params in layout:', e)
  }

  // Validate locale
  if (!locales.includes(lang)) {
    notFound()
  }

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  // Get messages for this locale
  const messages = await getMessages()

  // Fetch navigation and footer data server-side
  let navigationData = null
  let footerData = null

  try {
    navigationData = await getNavigation()
  } catch (error) {
    console.error('Failed to fetch navigation in layout:', error)
  }

  try {
    footerData = await getFooter()
  } catch (error) {
    console.error('Failed to fetch footer in layout:', error)
  }

  // Determine text direction
  const direction = lang === 'he' ? 'rtl' : 'ltr'

  return (
    <html lang={lang} dir={direction} suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var root = document.documentElement;
                  var isDark = localStorage.theme === 'dark' ||
                    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

                  // Explicitly set the theme class
                  root.classList.remove('light', 'dark');
                  root.classList.add(isDark ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation data={navigationData} lang={lang} />
              <main className="flex-1">{children}</main>
              <Footer data={footerData} lang={lang} />
            </div>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
