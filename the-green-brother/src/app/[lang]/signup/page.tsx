// Copyright (c) 2025 Affilibuster by Ronen Druker.

import SignupClient from '@/components/auth/SignupClient'
import { getAuthPage } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface SignupPageProps {
  params: Promise<{ lang: string }>
}

/**
 * Generate noindex metadata for the signup page.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with noindex robots directive
 */
export async function generateMetadata({ params }: SignupPageProps): Promise<Metadata> {
  const { lang } = await params
  const authPage = await getAuthPage(lang)
  return buildNoIndexMetadata({
    title: authPage?.seoMetadata.metaTitle,
    description: authPage?.seoMetadata.metaDescription,
  })
}

/**
 * Signup Page Component
 * @param root0 - Page props
 * @param root0.params - Route parameters
 * @returns Server Component
 */
export default async function Signup({ params }: SignupPageProps) {
  const { lang } = await params

  const authPage = await getAuthPage(lang)

  if (!authPage) {
    notFound()
  }

  const direction = (lang as LanguageCode) === LanguageCode.HE ? DirectionEnum.RTL : DirectionEnum.LTR

  return <SignupClient data={authPage} lang={lang} direction={direction} />
}
