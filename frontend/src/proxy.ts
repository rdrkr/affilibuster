// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Next.js Middleware for i18n routing, session management, and URL redirects
 * Reference: T124 (i18n proxy), T137 (Session ID generation), T145 (URL redirect handling)
 */

import { CodeEnum, type RedirectCheckResponse } from '@/lib/generated/types.gen'
import { DEFAULT_LANGUAGE_CODE, isLanguageCode, SUPPORTED_LANGUAGE_CODES, type LanguageCode } from '@/lib/types'
import createIntlMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Create next-intl proxy
const intlMiddleware = createIntlMiddleware({
  locales: [...SUPPORTED_LANGUAGE_CODES],
  defaultLocale: DEFAULT_LANGUAGE_CODE,
  localePrefix: 'always',
  alternateLinks: true,
  localeDetection: true,
})

/**
 * Check if a URL path should be redirected
 * @param path - The URL path to check
 * @returns Redirect info if found, null otherwise
 */
async function checkRedirect(path: string): Promise<RedirectCheckResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/v1/redirects/check?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Don't wait too long for redirect check
      signal: AbortSignal.timeout(1000),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as RedirectCheckResponse
  } catch {
    // If redirect check fails, continue with normal routing
    return null
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // T145: Check for URL redirects before i18n routing
  // Skip for static files, API routes, and Next.js internals
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const redirect = await checkRedirect(pathname)

    if (redirect?.found) {
      if (redirect.statusCode === 301 && redirect.targetUrl) {
        // Permanent redirect to new URL
        const newUrl = new URL(redirect.targetUrl, request.url)
        // Preserve query parameters
        newUrl.search = request.nextUrl.search
        return NextResponse.redirect(newUrl, 301)
      } else if (redirect.statusCode === 410) {
        // Gone - rewrite to 410 page
        const goneUrl = new URL('/410', request.url)
        return NextResponse.rewrite(goneUrl)
      }
    }
  }
  // Handle i18n routing
  const response = intlMiddleware(request)

  // Extract language from pathname for HTML lang/dir attributes
  // This is used by the root layout to set <html lang="..." dir="...">
  const langRegex = /^\/(en|it|he)(?:\/|$)/
  const match = langRegex.exec(pathname)

  let lang: LanguageCode = DEFAULT_LANGUAGE_CODE
  if (match?.[1] && isLanguageCode(match[1])) {
    lang = match[1]
  }

  // Determine text direction
  const dir: 'ltr' | 'rtl' = lang === CodeEnum.HE ? 'rtl' : 'ltr'

  // Create new response with custom headers for language detection
  const newResponse = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  })

  // Set custom headers for root layout
  newResponse.headers.set('x-language', lang)
  newResponse.headers.set('x-text-direction', dir)

  // Copy cookies from intl middleware response
  response.cookies.getAll().forEach(cookie => {
    newResponse.cookies.set(cookie)
  })

  // T137: Session ID generation and management
  const sessionId = request.cookies.get('session-id')?.value

  if (!sessionId) {
    // Generate new session ID
    const newSessionId = uuidv4()

    // Set session cookie (30 days expiry)
    newResponse.cookies.set({
      name: 'session-id',
      value: newSessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      path: '/',
    })
  }

  return newResponse
}

// noinspection JSUnusedGlobalSymbols
export const config = {
  // Match all pathnames except for:
  // - /api routes (API endpoints)
  // - /_next (Next.js internals)
  // - /static (static files)
  // - Files with extensions (images, etc.)
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
}
