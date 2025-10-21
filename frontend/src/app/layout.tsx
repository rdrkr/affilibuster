// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Layout (Minimal)
 * The actual layout with locale handling is in [lang]/layout.tsx
 */

import type { Metadata } from 'next'
import { contentAPI } from '@/lib/api'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await contentAPI.getSingleType('en', 'navigation')
    const navData = response?.data || response

    return {
      title: navData?.siteTitle || navData?.title,
      description: navData?.siteDescription || navData?.description,
      keywords: navData?.siteKeywords || navData?.keywords,
    }
  } catch (error) {
    console.error('Failed to fetch root metadata:', error)
    return {
      title: undefined,
      description: undefined,
      keywords: undefined,
    }
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
