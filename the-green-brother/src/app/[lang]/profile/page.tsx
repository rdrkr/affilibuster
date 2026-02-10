// Copyright (c) 2025 Affilibuster by Ronen Druker.

import ProfileClient from '@/components/profile/ProfileClient'
import { getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'

interface ProfilePageProps {
  params: Promise<{ lang: string }>
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
