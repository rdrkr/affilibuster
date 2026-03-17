// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LanguageCode } from '@/lib/middleware-types'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: Object.values(LanguageCode),
  defaultLocale: LanguageCode.EN,
})

/**
 * Proxy middleware that wraps next-intl middleware with additional security headers.
 *
 * Adds Content-Security-Policy `frame-ancestors`, X-Frame-Options, and additional
 * security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
 * to harden the application against common web vulnerabilities.
 * @param request - The incoming Next.js request
 * @returns NextResponse with i18n routing and security headers
 */
export default function middleware(request: NextRequest): NextResponse {
  const response = intlMiddleware(request)
  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL ?? 'https://localhost:1337'
  const isHttps = request.nextUrl.protocol === 'https:'

  response.headers.set('Content-Security-Policy', `frame-ancestors 'self' ${cmsUrl}`)
  response.headers.set('X-Frame-Options', `ALLOW-FROM ${cmsUrl}`)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (isHttps) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|api|images|icons|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)'],
}
