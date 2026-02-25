// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getNavigation, getProductCategories, getProductCategoriesPage, getProducts } from '@/lib/client'
import { userProfileFlag } from '@/lib/feature-flags'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import ProductsClient from './ProductsClient'

/**
 * Generate SEO metadata for the products page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({ params }: { params: Promise<{ lang: LanguageCode }> }): Promise<Metadata> {
  const { lang } = await params
  const [pageData, navigation] = await Promise.all([getProductCategoriesPage(lang), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: pageData?.seoMetadata,
    lang,
    path: '/products',
    siteName: navigation?.siteTitle,
  })
}

/**
 * Products listing page server component.
 *
 * Fetches products, categories, and page metadata from CMS in parallel
 * and passes them to the client component for rendering.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered products page
 */
export default async function ProductsPage({ params }: { params: Promise<{ lang: LanguageCode }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  // Fetch all products data in parallel
  const [pageData, productsResponse, categoriesResponse, enableUserProfile] = await Promise.all([
    getProductCategoriesPage(lang, { ...draftParams }),
    getProducts({
      pagination: { page: 1, pageSize: 100 }, // Get all products for client-side filtering
      locale: lang,
      ...draftParams,
    }),
    getProductCategories({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
      ...draftParams,
    }),
    userProfileFlag(),
  ])

  return (
    <ProductsClient
      pageData={pageData}
      products={productsResponse ?? []}
      categories={categoriesResponse ?? []}
      enableUserProfile={enableUserProfile}
    />
  )
}
