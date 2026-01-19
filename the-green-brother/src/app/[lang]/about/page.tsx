// Copyright (c) 2025 Affilibuster by Ronen Druker.

// Import getContributors
import { getAbout, getContributors } from '@/lib/client'
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

  // Fetch about page content and contributors
  // Filter out contributors that only have the "author" role (keep team members)
  const [aboutData, contributors] = await Promise.all([
    getAbout(lang),
    getContributors({
      locale: lang,
      filters: {
        roles: {
          roleId: {
            $nei: 'author',
          },
        },
      },
    }),
  ])

  return <AboutClient aboutData={aboutData} contributors={contributors ?? []} />
}
