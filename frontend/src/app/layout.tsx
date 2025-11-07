// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Layout (Minimal)
 * The actual layout with locale handling is in [lang]/layout.tsx
 */

import type { Metadata } from 'next'
import { getNavigation } from '@/lib/client'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const navData = await getNavigation()

    return {
      title: navData?.siteTitle ?? navData?.brandName,
      description: navData?.siteDescription,
      keywords: typeof navData?.siteKeywords === 'string' ? navData.siteKeywords.split(',') : undefined,
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
