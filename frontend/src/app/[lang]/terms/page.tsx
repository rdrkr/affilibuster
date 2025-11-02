// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Terms of Service Page
 * Fetches terms content from Strapi CMS (term single type)
 * Available in all languages: en, it, he
 */

import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { getTerm } from '@/lib/client'
import type { ApiTermTermDocument } from '@/lib/generated/types.gen'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params

  try {
    const termData = await getTerm()

    return {
      title: termData?.metaTitle,
      description: termData?.metaDescription,
    }
  } catch (error) {
    console.error('Failed to fetch term metadata:', error)
    return {
      title: undefined,
      description: undefined,
    }
  }
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'he' }]
}

export default async function TermsPage({ params }: Props) {
  let lang = 'en'
  let termData: ApiTermTermDocument | null = null

  try {
    const resolvedParams = await params
    if (resolvedParams?.lang) {
      lang = resolvedParams.lang
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  // Fetch term content from backend API
  try {
    termData = await getTerm()
  } catch (error) {
    console.error('Failed to fetch term content:', error)
  }

  // Don't render page if data is unavailable
  if (!termData || !termData.title || !termData.content) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">{termData.title}</h1>

      {termData.lastUpdated && termData.lastUpdatedLabel && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          {termData.lastUpdatedLabel}{' '}
          {new Date(termData.lastUpdated).toLocaleDateString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      )}

      {termData.content && (
        <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-secondary-600 prose-a:no-underline hover:prose-a:underline">
          <div dangerouslySetInnerHTML={{ __html: termData.content }} />
        </div>
      )}
    </div>
  )
}
