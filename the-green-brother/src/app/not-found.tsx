// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Link from 'next/link'

/**
 * Generate noindex metadata for the root 404 page to prevent search engine indexing.
 * @returns Metadata object with noindex robots directive
 */
export const metadata: Metadata = buildNoIndexMetadata({
  title: '404',
})

/**
 * Root-level 404 Not Found page.
 *
 * Handles 404 errors that occur outside the [lang] segment, such as
 * when the locale layout itself fails or when a route doesn't match
 * any [lang] pattern. Provides a minimal fallback with a link to the
 * default locale homepage.
 *
 * Does not depend on CMS data since this page renders when the
 * backend/CMS may be unreachable.
 * @returns Minimal 404 page with a link to the homepage
 */
export default function RootNotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl">&#128269;</div>
      <Link
        href="/en"
        className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700"
      >
        &larr;
      </Link>
    </div>
  )
}
