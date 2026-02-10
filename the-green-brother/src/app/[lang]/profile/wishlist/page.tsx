// Copyright (c) 2025 Affilibuster by Ronen Druker.

import WishlistClient from '@/components/profile/WishlistClient'
import { getProfile } from '@/lib/content/api'
import { DirectionEnum, LanguageCode } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'

interface WishlistPageProps {
  params: Promise<{ lang: string }>
}

/**
 * Wishlist Page Component
 * @param root0 - Page props
 * @param root0.params - Route parameters
 * @returns Server Component
 */
export default async function Wishlist({ params }: WishlistPageProps) {
  const { lang } = await params

  const profileData = await getProfile(lang)

  if (!profileData) {
    notFound()
  }

  const direction = (lang as LanguageCode) === LanguageCode.HE ? DirectionEnum.RTL : DirectionEnum.LTR

  return <WishlistClient data={profileData} lang={lang} direction={direction} />
}
