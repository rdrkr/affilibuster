// Copyright (c) 2025 Affilibuster by Ronen Druker.

import DeleteAccountClient from '@/components/profile/DeleteAccountClient'
import { getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'

interface DeleteAccountPageProps {
  params: Promise<{ lang: string }>
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
