// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * 410 Gone page
 * Reference: T145 (URL redirect handling - 410 status)
 * Displayed when a URL is permanently removed
 * Fetches content from Strapi error-410 single type
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { getError410 } from '@/lib/client'
import { Button } from '@/components/Button'

/**
 * Generate metadata for 410 error page
 * Fetches title and description from Strapi CMS
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const errorData = await getError410()

    return {
      title: errorData?.metaTitle,
      description: errorData?.metaDescription,
      robots: {
        index: false,
        follow: false,
      },
    }
  } catch (error) {
    console.error('Failed to fetch 410 error page metadata:', error)
    return {
      title: undefined,
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export default async function GonePage() {
  let errorData = null
  try {
    // Try to fetch error-410 content from Strapi
    errorData = await getError410()
  } catch (error) {
    console.error('Failed to fetch 410 error page:', error)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full text-center px-4" data-testid="410-page">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-2">410</h1>
          {errorData?.subtitle && (
            <h2 className="text-2xl font-semibold text-neutral-700 mb-4">{errorData.subtitle}</h2>
          )}
          {errorData?.message && <p className="text-neutral-600 mb-8">{errorData.message}</p>}
        </div>

        <div className="space-y-4">
          {errorData?.ctaText && (
            <Link href="/" data-testid="410-home-link">
              <Button variant="secondary">{errorData.ctaText}</Button>
            </Link>
          )}

          {errorData?.supportContactMessage && (
            <p className="text-sm text-neutral-500">{errorData.supportContactMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
