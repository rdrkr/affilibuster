// Copyright (c) 2025 Affilibuster by Ronen Druker.

import LoginClient from '@/components/auth/LoginClient'
import { getAuthPage } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface LoginPageProps {
  params: Promise<{ lang: string }>
}

/**
 * Generate noindex metadata for the login page.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with noindex robots directive
 */
export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { lang } = await params
  const authPage = await getAuthPage(lang)
  return buildNoIndexMetadata({
    title: authPage?.seoMetadata.metaTitle,
    description: authPage?.seoMetadata.metaDescription,
  })
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
