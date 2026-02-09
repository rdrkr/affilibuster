// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getProductBySlug, getProductCategoriesPage, getProducts } from '@/lib/client'
import { userProfileFlag } from '@/lib/feature-flags'
import { CodeEnum } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

/**
 * Product detail page server component.
 *
 * Fetches a single product by Slug from CMS and passes it to the client component.
 * Returns 404 if product not found.
 * @param params - Route parameters containing language code and product slug
 * @param params.params - Promise containing route parameters with lang and slug
 * @returns Server-rendered product detail page
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ lang: CodeEnum; slug: string }> }) {
  const resolvedParams = await params
  const { lang, slug } = resolvedParams

  // Fetch product by Slug
  const [product, productCategoriesPage, userProfileEnabled] = await Promise.all([
    getProductBySlug(slug, { locale: lang }),
    getProductCategoriesPage(lang),
    userProfileFlag(),
  ])

  // Return 404 if product not found
  if (!product || !productCategoriesPage) {
    notFound()
  }

  // Fetch related products (same category, exclude current)
  // Use explicit type casting for filters as 'category' is missing from generated ItemsEnum12 but supported by API
  const relatedProductsResponse = await getProducts({
    filters: {
      category: {
        slug: {
          $eq: product.category.slug,
        },
      },
      slug: {
        $ne: slug,
      },
    } as NonNullable<NonNullable<Parameters<typeof getProducts>[0]>['filters']>,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    locale: lang,
  })

  return (
    <ProductDetailClient
      product={product}
      certificatesHeader={productCategoriesPage.certificatesSectionHeader}
      relatedProducts={relatedProductsResponse?.data ?? []}
      relatedProductsHeader={productCategoriesPage.relatedProductsSectionHeader}
      enableUserProfile={userProfileEnabled}
      bySellerText={productCategoriesPage.bySellerText}
    />
  )
}
