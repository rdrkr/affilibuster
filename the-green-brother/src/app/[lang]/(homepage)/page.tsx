// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { HomeSections } from '@/components/homepage'
import { getBlog, getHomepage, getNavigation, getTeamMembers } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
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

  // Fetch all homepage data in parallel
  const [homepageData, teamMembers, enableUserProfile, blogPageResponse] = await Promise.all([
    getHomepage(lang, { ...draftParams }),
    getTeamMembers(lang),
    userProfileFlag(),
    getBlog(lang, { ...draftParams }),
  ])

  if (!homepageData || !blogPageResponse) {
    return null
  }

  // Pass data to client component
  return (
    <HomeClient>
      <HomeSections
        sections={homepageData.sections}
        teamMembers={teamMembers}
        enableUserProfile={enableUserProfile}
        readTimeMinutesLabel={blogPageResponse.readTimeMinutesLabel}
        readArticleLabel={blogPageResponse.readArticleLabel}
      />
    </HomeClient>
  )
}

export default HomePage as unknown as (props: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>
