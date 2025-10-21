// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Page - Redirects to default locale
 * Reference: T126 (Root page with language detection)
 */

import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to default locale
  // The proxy will handle locale detection and redirect appropriately
  redirect('/en')
}
