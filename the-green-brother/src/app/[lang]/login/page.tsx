// Copyright (c) 2025 Affilibuster by Ronen Druker.

import LoginClient from '@/components/auth/LoginClient'
import { getAuthPage } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'

interface LoginPageProps {
  params: Promise<{ lang: string }>
}

/**
 * Login Page Component
 * @param root0 - Page props
 * @param root0.params - Route parameters
 * @returns Server Component
 */
export default async function Login({ params }: LoginPageProps) {
  const { lang } = await params

  const authPage = await getAuthPage(lang)

  if (!authPage) {
    notFound()
  }

  const direction = (lang as LanguageCode) === LanguageCode.HE ? DirectionEnum.RTL : DirectionEnum.LTR

  return <LoginClient data={authPage} lang={lang} direction={direction} />
}
