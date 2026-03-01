// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { notFound } from 'next/navigation'

/**
 * Catch-all route for unmatched paths within the [lang] segment.
 * Triggers the localized not-found.tsx page so that the layout
 * (with Navigation and Footer) is preserved.
 */
export default function CatchAllNotFound() {
  notFound()
}
