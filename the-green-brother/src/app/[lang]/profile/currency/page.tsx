// Copyright (c) 2025 Affilibuster by Ronen Druker.

import CurrencyClient from '@/components/profile/CurrencyClient'
import { getCurrencies, getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface CurrencyPageProps {
  params: Promise<{ lang: string }>
}

/**
 * Generate noindex metadata for the currency preference page.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with noindex robots directive
 */
export async function generateMetadata({ params }: CurrencyPageProps): Promise<Metadata> {
  const { lang } = await params
  const profileData = await getProfile(lang)
  return buildNoIndexMetadata({
    title: profileData?.seoMetadata.metaTitle,
    description: profileData?.seoMetadata.metaDescription,
  })
}

/**
 * Currency Page Component
 * @param root0 - Page props
 * @param root0.params - Route parameters
 * @returns Server Component
 */
export default async function Currency({ params }: CurrencyPageProps) {
  const { lang } = await params

  const [profileData, currencies] = await Promise.all([getProfile(lang), getCurrencies(lang)])

  if (!profileData || !currencies) {
    notFound()
  }

  const direction = (lang as LanguageCode) === LanguageCode.HE ? DirectionEnum.RTL : DirectionEnum.LTR

  return <CurrencyClient profileData={profileData} currencies={currencies} lang={lang} direction={direction} />
}
