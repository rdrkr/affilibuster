// Copyright (c) 2025 Affilibuster by Ronen Druker.

import DeleteAccountClient from '@/components/profile/DeleteAccountClient'
import { getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface DeleteAccountPageProps {
  params: Promise<{ lang: string }>
}

/**
 * Generate noindex metadata for the delete account page.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with noindex robots directive
 */
export async function generateMetadata({ params }: DeleteAccountPageProps): Promise<Metadata> {
  const { lang } = await params
  const profileData = await getProfile(lang)
  return buildNoIndexMetadata({
    title: profileData?.seoMetadata.metaTitle,
    description: profileData?.seoMetadata.metaDescription,
  })
}

/**
 * DeleteAccount Page Component
 * @param root0 - Page props
 * @param root0.params - Route parameters
 * @returns Server Component
 */
export default async function DeleteAccount({ params }: DeleteAccountPageProps) {
  const { lang } = await params

  const profileData = await getProfile(lang)

  if (!profileData) {
    notFound()
  }

  const direction = (lang as LanguageCode) === LanguageCode.HE ? DirectionEnum.RTL : DirectionEnum.LTR

  return <DeleteAccountClient data={profileData} lang={lang} direction={direction} />
}
