// Copyright (c) 2025 Affilibuster by Ronen Druker.

import SignupClient from '@/components/auth/SignupClient'
import { getAuthPage } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'

interface SignupPageProps {
  params: Promise<{ lang: string }>
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
