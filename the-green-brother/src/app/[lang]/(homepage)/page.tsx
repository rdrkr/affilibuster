// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { HomeSections } from '@/components/homepage'
import { getBlogPosts, getHomepage, getProductCategories, getProducts } from '@/lib/client'
import { userProfileFlag } from '@/lib/feature-flags'
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
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
  const [homepageData, productsResponse, categoriesResponse, blogPostsResponse, languages, enableUserProfile] =
    await Promise.all([
      getHomepage(lang),
      getProducts({
        pagination: { page: 1, pageSize: 4 },
        locale: lang,
      }),
      getProductCategories({
        locale: lang,
      }),
      getBlogPosts({
        pagination: { page: 1, pageSize: 3 },
        locale: lang,
      }),
      getLanguages(),
      userProfileFlag(),
    ])

  // Find the current language's direction (default to LTR)
  const currentLanguage = languages?.find(l => l.code === lang)
  const direction = currentLanguage?.direction ?? DirectionEnum.LTR

  if (!homepageData) {
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
        direction={direction}
        enableUserProfile={enableUserProfile}
      />
    </HomeClient>
  )
}

export default HomePage as unknown as (props: { params: Promise<{ lang: string }> }) => Promise<React.ReactElement>
