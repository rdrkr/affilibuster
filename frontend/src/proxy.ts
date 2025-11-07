// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Next.js Middleware for i18n routing and session management
 * Reference: T124 (i18n proxy), T137 (Session ID generation)
 */

import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGE_CODES, DEFAULT_LANGUAGE_CODE } from '@/lib/types'

// Create next-intl proxy
const intlMiddleware = createIntlMiddleware({
  locales: [...SUPPORTED_LANGUAGE_CODES],
  defaultLocale: DEFAULT_LANGUAGE_CODE,
  localePrefix: 'always',
  alternateLinks: true,
  localeDetection: true,
})

export default function proxy(request: NextRequest) {
  // Handle i18n routing
  const response = intlMiddleware(request)

  // T137: Session ID generation and management
  const sessionId = request.cookies.get('session-id')?.value

  if (!sessionId) {
    // Generate new session ID
    const newSessionId = uuidv4()

    // Set session cookie (30 days expiry)
    response.cookies.set({
      name: 'session-id',
      value: newSessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      path: '/',
    })
  }

  return response
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
