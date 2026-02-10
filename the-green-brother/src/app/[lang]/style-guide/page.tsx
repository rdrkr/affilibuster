// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Style Guide Page
 * Displays the design system and reusable components for TheGreenBrother
 * Available in all languages
 */

import { LanguageCode, SUPPORTED_LANGUAGE_CODES, isLanguageCode } from '@/lib/types'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import StyleGuideClient from './StyleGuideClient'

interface Props {
  params: Promise<{ lang: LanguageCode }>
}

/**
 * Generate static params for all supported languages
 * @returns Array of language code params
 */
export function generateStaticParams() {
  return SUPPORTED_LANGUAGE_CODES.map(lang => ({ lang }))
}

/**
 * Generate metadata for the style guide page
 * @returns Metadata object
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Style Guide - TheGreenBrother',
    description: 'Design system reference for TheGreenBrother',
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
 * @param props - Page props
 * @param props.params - Promise containing the language parameter
 * @returns The style guide page component
 */

// ... imports remain the same ...

/**
 * StyleGuidePage component.
 * Renders the StyleGuideClient with appropriate language and direction settings.
 * @param root0 - Component props
 * @param root0.params - Promise resolving to page parameters (lang)
 * @returns The rendered style guide page
 */
async function StyleGuidePage({ params }: Props): Promise<React.ReactElement> {
  let resolvedParams
  try {
    resolvedParams = await params
  } catch (error) {
    console.error('Error resolving params:', error)
    resolvedParams = { lang: LanguageCode.EN }
  }
  let lang: LanguageCode = LanguageCode.EN
  if (isLanguageCode(resolvedParams.lang as unknown as string)) {
    lang = resolvedParams.lang
  }

  // Enable static rendering
  setRequestLocale(lang.toString())

  return <StyleGuideClient />
}

export default StyleGuidePage as unknown as (props: {
  params: Promise<{ lang: string }>
}) => Promise<React.ReactElement>
