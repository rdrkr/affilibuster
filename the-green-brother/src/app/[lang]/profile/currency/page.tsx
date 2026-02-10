// Copyright (c) 2025 Affilibuster by Ronen Druker.

import CurrencyClient from '@/components/profile/CurrencyClient'
import { getCurrencies, getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'

interface CurrencyPageProps {
  params: Promise<{ lang: string }>
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
