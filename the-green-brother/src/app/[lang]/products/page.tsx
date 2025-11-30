// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getProductCategories, getProductCategoriesPage, getProducts } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import ProductsClient from './ProductsClient'

/**
 * Products listing page server component.
 *
 * Fetches products, categories, and page metadata from CMS in parallel
 * and passes them to the client component for rendering.
 * @param params - Route parameters containing language code
 * @param params.params - Promise containing route parameters with lang
 * @returns Server-rendered products page
 */
export default async function ProductsPage({ params }: { params: Promise<{ lang: CodeEnum }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  // Fetch all products data in parallel
  const [pageData, productsResponse, categoriesResponse] = await Promise.all([
    getProductCategoriesPage(lang),
    getProducts({
      pagination: { page: 1, pageSize: 100 }, // Get all products for client-side filtering
      locale: lang,
    }),
    getProductCategories({
      pagination: { page: 1, pageSize: 100 },
      locale: lang,
    }),
  ])

  return (
    <ProductsClient
      pageData={pageData}
      products={productsResponse?.data ?? []}
      categories={categoriesResponse?.data ?? []}
    />
  )
}
