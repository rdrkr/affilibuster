// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LanguageCode } from '@/lib/generated/types.gen'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: Object.values(LanguageCode),

  // Used when no locale matches
  defaultLocale: LanguageCode.EN,
})

/**
 * Proxy middleware that wraps next-intl middleware with additional security headers.
 *
 * Adds Content-Security-Policy `frame-ancestors` and X-Frame-Options headers
 * to allow Strapi admin to embed the Next.js preview in an iframe.
 * @param request - The incoming Next.js request
 * @returns NextResponse with i18n routing and CSP headers
 */
export default function middleware(request: NextRequest): NextResponse {
  const response = intlMiddleware(request)
  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? 'https://localhost:1337'

  response.headers.set('Content-Security-Policy', `frame-ancestors 'self' ${cmsUrl}`)
  response.headers.set('X-Frame-Options', `ALLOW-FROM ${cmsUrl}`)

  return response
}

export const config = {
  // Match all internationalized pathnames
  matcher: [
    // Skip Next.js internals, API routes, static files, and metadata files
    '/((?!_next|api|images|icons|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
}
