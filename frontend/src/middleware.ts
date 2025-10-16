// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Next.js Middleware for i18n routing, session management, and URL redirects
 * Reference: T124 (i18n middleware), T137 (Session ID generation), T145 (URL redirect handling)
 */

import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { v4 as uuidv4 } from 'uuid';

// Create next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'it', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always',
  alternateLinks: true,
  localeDetection: true,
});

/**
 * T145: Check for URL redirects (301/410) from backend
 */
async function checkUrlRedirect(pathname: string): Promise<{
  type: 'redirect' | 'gone' | 'none';
  destination?: string;
} | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Call backend API to check if this URL has a redirect or is gone
    const response = await fetch(
      `${apiUrl}/v1/url-routes/check?path=${encodeURIComponent(pathname)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Use short timeout for middleware
        signal: AbortSignal.timeout(1000),
      }
    );

    if (!response.ok) {
      // No redirect found or API error
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // If API is unreachable or times out, allow request to proceed
    console.warn('URL redirect check failed:', error);
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // T145: Check for URL redirects before proceeding
  const redirectInfo = await checkUrlRedirect(pathname);

  if (redirectInfo) {
    if (redirectInfo.type === 'redirect' && redirectInfo.destination) {
      // 301 Permanent Redirect
      return NextResponse.redirect(
        new URL(redirectInfo.destination, request.url),
        { status: 301 }
      );
    } else if (redirectInfo.type === 'gone') {
      // 410 Gone - redirect to custom 410 page
      return NextResponse.rewrite(new URL('/410', request.url));
    }
  }

  // Handle i18n routing
  const response = intlMiddleware(request);

  // T137: Session ID generation and management
  const sessionId = request.cookies.get('session-id')?.value;

  if (!sessionId) {
    // Generate new session ID
    const newSessionId = uuidv4();

    // Set session cookie (30 days expiry)
    response.cookies.set({
      name: 'session-id',
      value: newSessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      path: '/',
    });
  }

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - /api routes (API endpoints)
  // - /_next (Next.js internals)
  // - /static (static files)
  // - Files with extensions (images, etc.)
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
};
