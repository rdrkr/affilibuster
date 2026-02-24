// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Preview Route Handler
 *
 * Enables or disables Next.js draft mode based on query parameters from Strapi's
 * preview button. Validates the shared secret before enabling draft mode and
 * redirects to the requested content slug.
 *
 * Uses NextResponse.redirect() instead of next/navigation redirect() to allow
 * setting cookie attributes (SameSite=None) for cross-origin iframe compatibility
 * when Strapi admin embeds the preview in an iframe panel.
 */

import { cookies, draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/** Cookie name used by Next.js draft mode. */
const DRAFT_MODE_COOKIE = '__prerender_bypass'

/**
 * Handle GET requests to enable draft mode for content preview.
 *
 * Called by Strapi's preview button with a shared secret, content slug, and status.
 * Validates the secret, enables/disables draft mode, and redirects to the content page.
 * Sets SameSite=None on the draft mode cookie for cross-origin iframe compatibility.
 * @param request - The incoming Next.js request containing preview query parameters
 * @returns 401 Response if secret is invalid or slug is missing, otherwise redirects to slug
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const status = searchParams.get('status')

  if (secret !== process.env.PREVIEW_SECRET || !slug) {
    return new Response('Invalid token', { status: 401 })
  }

  const draft = await draftMode()

  if (status === 'published') {
    draft.disable()
  } else {
    draft.enable()
  }

  // Build the redirect URL using the forwarded host (from reverse proxy) or
  // the request host, so the redirect goes to the public URL, not the internal
  // Docker container address (e.g., 0.0.0.0:3000).
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = forwardedHost ?? request.headers.get('host') ?? 'localhost:3000'
  const origin = `${forwardedProto}://${host}`
  const url = new URL(slug, origin)
  const response = NextResponse.redirect(url)

  // Copy draft mode cookie from Next.js internal response and override SameSite
  // to None for cross-origin iframe compatibility (Strapi admin preview panel).
  const cookieStore = await cookies()
  const bypassCookie = cookieStore.get(DRAFT_MODE_COOKIE)

  if (status !== 'published' && bypassCookie) {
    response.cookies.set(DRAFT_MODE_COOKIE, bypassCookie.value, {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      path: '/',
    })
  }

  return response
}
