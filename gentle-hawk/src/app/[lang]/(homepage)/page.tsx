// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { HomeSections } from '@/components/homepage'
import { JsonLdScript } from '@/components/seo'
import { ServerHeroSection } from '@/components/sections'
import { getHomepage, getNavigation } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { DirectionEnum, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { buildOrganizationJsonLd, buildPageMetadata, buildWebSiteJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import HomeClient from './HomeClient'

/**
 * Generate SEO metadata for the homepage from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const [pageData, navigation] = await Promise.all([getHomepage(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: pageData?.seoMetadata,
    lang,
    path: '',
    siteName: navigation?.siteTitle,
  })
}

/**
 * Homepage Server Component
 *
 * Fetches all necessary data from CMS via backend API at build/request time.
 * Passes data to client component for rendering with animations.
 * When draft mode is enabled, fetches draft content for preview.
 * @param props - Route params including language
 * @param props.params - Promise containing route parameters with lang
 * @returns Homepage with server-fetched CMS data
 */
async function HomePage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'

  const [homepageData, enableUserProfile, navigation, languages] = await Promise.all([
    getHomepage(lang, { ...draftParams }),
    userProfileFlag(),
    getNavigation(lang),
    getLanguages(),
  ])

  if (!homepageData) {
    return null
  }

  const siteName = navigation?.siteTitle ?? 'GentleHawk'
  const logoUrl = navigation?.brandButton.label?.icon

  const currentLanguage = languages?.find(l => l.code === lang)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  const heroSection = homepageData.sections.find(s => s.__component === 'sections.hero')
  const heroSlot = heroSection ? <ServerHeroSection data={heroSection} direction={direction} /> : undefined

  return (
    <>
      <JsonLdScript data={buildOrganizationJsonLd(siteName, siteUrl, logoUrl)} />
      <JsonLdScript data={buildWebSiteJsonLd(siteName, siteUrl)} />
      {heroSlot && <div className="mt-8">{heroSlot}</div>}
      <HomeClient className={heroSlot ? 'mt-16!' : ''}>
        <HomeSections sections={homepageData.sections} enableUserProfile={enableUserProfile} skipHero={!!heroSlot} />
      </HomeClient>
    </>
  )
}

export default HomePage as unknown as (props: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>
