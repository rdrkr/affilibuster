// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Draft Mode Banner Component
 *
 * Displays a visual indicator when Next.js draft mode is active,
 * informing content editors that they are viewing unpublished draft content.
 * Provides a link to exit draft mode and return to published content.
 */

import Link from 'next/link'

/**
 * A banner displayed at the top of the page when draft mode is enabled.
 *
 * Shows a warning-styled bar with a message indicating draft preview is active
 * and a link to disable it. Uses theme colors for consistent styling.
 * @returns The draft mode banner element
 */
export default function DraftModeBanner(): React.ReactElement {
  return (
    <div className="bg-warning-600 px-4 py-2 text-center text-sm font-medium text-neutral-900">
      Draft mode is enabled.{' '}
      <Link href="/api/preview/disable" className="font-bold underline hover:text-neutral-700">
        Exit preview
      </Link>
    </div>
  )
}
