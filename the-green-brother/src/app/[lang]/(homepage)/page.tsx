// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { HomeSections } from '@/components/homepage'
import { getBlog, getBlogPosts, getContributors, getHomepage, getProductCategories, getProducts } from '@/lib/client'
import { userProfileFlag } from '@/lib/feature-flags'
import { CodeEnum } from '@/lib/generated/types.gen'
import HomeClient from './HomeClient'

/**
 * Homepage Server Component
 *
 * Fetches all necessary data from CMS via backend API at build/request time.
 * Passes data to client component for rendering with animations.
 * @param props - Route params including language
 * @param props.params - Promise containing route parameters with lang
 * @returns Homepage with server-fetched CMS data
 */
async function HomePage({ params }: { params: Promise<{ lang: CodeEnum }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  // Fetch all homepage data in parallel
  const [
    homepageData,
    productsResponse,
    categoriesResponse,
    blogPostsResponse,
    authors,
    enableUserProfile,
    blogPageResponse,
  ] = await Promise.all([
    getHomepage(lang),
    getProducts({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
    }),
    getProductCategories({
      locale: lang,
    }),
    getBlogPosts({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
    }),
    getContributors({
      locale: lang,
      filters: {
        roles: {
          roleId: {
            $ei: 'author',
          },
        },
      },
    }),
    userProfileFlag(),
    getBlog(lang),
  ])

  if (!homepageData || !blogPageResponse?.defaultContributor) {
    return null
  }

  // Pass data to client component
  return (
    <HomeClient>
      <HomeSections
        sections={homepageData.sections}
        products={productsResponse?.data ?? []}
        categories={categoriesResponse?.data ?? []}
        blogPosts={blogPostsResponse?.data ?? []}
        contributors={authors ?? []}
        enableUserProfile={enableUserProfile}
        readTimeMinutesLabel={blogPageResponse.readTimeMinutesLabel}
        readArticleLabel={blogPageResponse.readArticleLabel}
        defaultContributor={blogPageResponse.defaultContributor}
      />
    </HomeClient>
  )
}

export default HomePage as unknown as (props: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>
