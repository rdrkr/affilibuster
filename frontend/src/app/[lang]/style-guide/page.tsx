// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Style Guide Page
 * Displays the design system and reusable components
 * Available in all languages
 */

import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import type { LanguageCode } from '@/lib/types'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import StyleGuideClient from './StyleGuideClient'

interface Props {
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGE_CODES.map(lang => ({ lang }))
}

export function generateMetadata(): Metadata {
  return {
    title: 'Style Guide - Affilibuster',
    description: 'Design system reference for Affilibuster',
    robots: {
      index: false, // Don't index style guide in production
      follow: false,
    },
  }
}

/**
 * Style Guide Page - Server Component
 * Centralizes the site's design system and reusable components.
 * This page serves as a reference for developers to maintain consistency across the site.
 *
 * @param props - Page props
 * @returns The style guide page component
 */
export default async function StyleGuidePage({ params }: Props): Promise<React.ReactElement> {
  let lang: LanguageCode = 'en' as LanguageCode
  try {
    const resolvedParams = await params
    if (resolvedParams.lang) {
      lang = resolvedParams.lang as LanguageCode
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  // Enable static rendering
  setRequestLocale(lang)

  return <StyleGuideClient lang={lang} />
}
