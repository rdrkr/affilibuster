// Copyright (c) 2025 Affilibuster by Ronen Druker.

import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'it', 'he'],

  // Used when no locale matches
  defaultLocale: 'en',
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(it|en|he)/:path*'],
}
