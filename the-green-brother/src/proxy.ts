// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { LanguageCode } from '@/lib/generated/types.gen'
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: Object.values(LanguageCode),

  // Used when no locale matches
  defaultLocale: LanguageCode.EN,
})

export const config = {
  // Match all internationalized pathnames
  matcher: [
    // Skip Next.js internals, API routes, static files, and metadata files
    '/((?!_next|api|images|icons|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
}
