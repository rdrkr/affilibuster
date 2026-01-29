// Copyright (c) 2025 Affilibuster by Ronen Druker.

// Import getContributors
import { getAbout, getTeamMembers } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import AboutClient from './AboutClient'

/**
 * About page server component.
 *
 * Fetches about page content from CMS and passes it to the client component.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered about page
 */
export default async function AboutPage({ params }: { params: Promise<{ lang: CodeEnum }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  // Fetch about page content and team members
  const [aboutData, teamMembers] = await Promise.all([getAbout(lang), getTeamMembers(lang)])

  return <AboutClient aboutData={aboutData} contributors={teamMembers} />
}
