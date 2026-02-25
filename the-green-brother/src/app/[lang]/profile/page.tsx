// Copyright (c) 2025 Affilibuster by Ronen Druker.

import ProfileClient from '@/components/profile/ProfileClient'
import { getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface ProfilePageProps {
  params: Promise<{ lang: string }>
}

/**
 * Generate noindex metadata for the profile page.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with noindex robots directive
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { lang } = await params
  const profileData = await getProfile(lang)
  return buildNoIndexMetadata({
    title: profileData?.seoMetadata.metaTitle,
    description: profileData?.seoMetadata.metaDescription,
  })
}

/**
 * Profile Page Component
 * @param root0 - Page props
 * @param root0.params - Route parameters
 * @returns Server Component
 */
export default async function Profile({ params }: ProfilePageProps) {
  const { lang } = await params

  const profileData = await getProfile(lang)

  if (!profileData) {
    notFound()
  }

  const direction = (lang as LanguageCode) === LanguageCode.HE ? DirectionEnum.RTL : DirectionEnum.LTR

  return <ProfileClient data={profileData} lang={lang} direction={direction} />
}
