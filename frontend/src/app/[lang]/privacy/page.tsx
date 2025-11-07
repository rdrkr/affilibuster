// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Privacy Policy Page
 * Fetches privacy content from Strapi CMS
 * Available in all languages: en, it, he
 */

import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { getPrivacy } from '@/lib/client'
import type { ApiPrivacyPrivacyDocument } from '@/lib/generated/types.gen'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  try {
    const privacyData = await getPrivacy(lang)

    return {
      title: privacyData?.metaTitle,
      description: privacyData?.metaDescription,
    }
  } catch (error) {
    console.error('Failed to fetch privacy metadata:', error)
    return {
      title: undefined,
      description: undefined,
    }
  }
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGE_CODES.map(lang => ({ lang }))
}

export default async function PrivacyPage({ params }: Props) {
  let lang = 'en'
  let privacyData: ApiPrivacyPrivacyDocument | null = null

  try {
    const resolvedParams = await params
    if (resolvedParams.lang) {
      lang = resolvedParams.lang
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  // Fetch privacy content from backend API
  try {
    privacyData = await getPrivacy(lang)
  } catch (error) {
    console.error('Failed to fetch privacy content:', error)
  }

  // Don't render page if data is unavailable
  if (!privacyData?.title || !privacyData.content) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">{privacyData.title}</h1>

      {privacyData.lastUpdated && privacyData.lastUpdatedLabel && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          {privacyData.lastUpdatedLabel}{' '}
          {new Date(privacyData.lastUpdated).toLocaleDateString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}

      {privacyData.content && (
        <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-secondary-600 prose-a:no-underline hover:prose-a:underline">
          <div dangerouslySetInnerHTML={{ __html: privacyData.content }} />
        </div>
      )}
    </div>
  )
}
