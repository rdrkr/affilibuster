// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Page - redirects to default locale
 * Reference: T126 (Root page with language detection)
 */

import { redirect } from 'next/navigation'
import { getDefaultLanguage } from '@/config/languages'

export default async function RootPage() {
  // Redirect to default locale dynamically fetched from backend
  // The proxy will handle locale detection and redirect appropriately
  const defaultLang = await getDefaultLanguage()
  redirect(`/${defaultLang.code}`)
}
