// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Layout (Minimal)
 * The actual layout with locale handling is in [lang]/layout.tsx
 * This layout sets HTML lang/dir attributes for all pages including 404s
 */

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { isLanguageCode, DEFAULT_LANGUAGE_CODE, type LanguageCode } from '@/lib/types'
import { AuthProvider } from '@/lib/auth'
import { LanguagePrompt } from '@/components/LanguagePrompt'

// Metadata for root-level pages (like not-found.tsx)
// Note: This gets overridden by child layouts/pages metadata
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex, nofollow', // 404 pages should not be indexed
}

/**
 * Extract language and direction from middleware-set headers
 * Middleware runs on every request and reliably detects language from URL
 */
async function getLangAndDir(): Promise<{ lang: LanguageCode; dir: 'ltr' | 'rtl' }> {
  let lang: LanguageCode = DEFAULT_LANGUAGE_CODE
  let dir: 'ltr' | 'rtl' = 'ltr'

  try {
    const headersList = await headers()

    // Read custom headers set by middleware
    const xLanguage = headersList.get('x-language')
    const xTextDirection = headersList.get('x-text-direction')

    // Validate and use middleware-provided values
    if (xLanguage && isLanguageCode(xLanguage)) {
      lang = xLanguage
    }

    if (xTextDirection === 'rtl' || xTextDirection === 'ltr') {
      dir = xTextDirection
    }
  } catch (e) {
    console.error('Failed to extract language from middleware headers:', e)
  }

  return { lang, dir }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Extract language and direction from middleware headers for SEO and accessibility
  const { lang, dir } = await getLangAndDir()

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
          <LanguagePrompt />
        </AuthProvider>
      </body>
    </html>
  )
}
