// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { HomeSections } from '@/components/homepage'
import { JsonLdScript } from '@/components/seo'
import { ServerHeroSection } from '@/components/sections'
import { getBlog, getHomepage, getNavigation, getTeamMembers } from '@/lib/content'
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Fetch all homepage data in parallel
  const [homepageData, teamMembers, enableUserProfile, blogPageResponse, navigation, languages] = await Promise.all([
    getHomepage(lang, { ...draftParams }),
    getTeamMembers(lang),
    userProfileFlag(),
    getBlog(lang, { ...draftParams }),
    getNavigation(lang),
    getLanguages(),
  ])

  if (!homepageData || !blogPageResponse) {
    return null
  }

  const siteName = navigation?.siteTitle ?? 'TheGreenBrother'
  const logoUrl = navigation?.brandButton.label?.icon

  // Derive direction for server-rendered hero (same logic as layout.tsx)
  const currentLanguage = languages?.find(l => l.code === lang)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  // Find the hero section from CMS data for server-side rendering
  const heroSection = homepageData.sections.find(s => s.__component === 'sections.hero')
  const heroSlot = heroSection ? <ServerHeroSection data={heroSection} direction={direction} /> : undefined

  // Pass data to client component
  return (
    <>
      <JsonLdScript data={buildOrganizationJsonLd(siteName, siteUrl, logoUrl)} />
      <JsonLdScript data={buildWebSiteJsonLd(siteName, siteUrl)} />
      <HomeClient>
        <HomeSections
          sections={homepageData.sections}
          teamMembers={teamMembers}
          enableUserProfile={enableUserProfile}
          readTimeMinutesLabel={blogPageResponse.readTimeMinutesLabel}
          readArticleLabel={blogPageResponse.readArticleLabel}
          heroSlot={heroSlot}
        />
      </HomeClient>
    </>
  )
}

export default HomePage as unknown as (props: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>
