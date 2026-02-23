// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { HomeSections } from '@/components/homepage'
import { getBlog, getHomepage, getTeamMembers } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import HomeClient from './HomeClient'

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
