// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getProductBySlug, getProductCategoriesPage, getProducts } from '@/lib/client'
import { userProfileFlag } from '@/lib/feature-flags'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

/**
 * Product detail page server component.
 *
 * Fetches a single product by Slug from CMS and passes it to the client component.
 * Returns 404 if product not found.
 * When draft mode is enabled, fetches draft content for preview.
 * @param params - Route parameters containing language code and product slug
 * @param params.params - Promise containing route parameters with lang and slug
 * @returns Server-rendered product detail page
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ lang: LanguageCode; slug: string }> }) {
  const resolvedParams = await params
  const { lang, slug } = resolvedParams
  const { isEnabled: isDraft } = await draftMode()
  const draftParams = isDraft ? { status: SchemaEnum.DRAFT as const } : {}

  // Fetch product by Slug
  const [product, productCategoriesPage, userProfileEnabled] = await Promise.all([
    getProductBySlug(slug, { locale: lang, ...draftParams }),
    getProductCategoriesPage(lang, { ...draftParams }),
    userProfileFlag(),
  ])

  // Return 404 if product not found
  if (!product || !productCategoriesPage) {
    notFound()
  }

  // Fetch related products (same category, exclude current)
  const relatedProductsResponse =
    (await getProducts({
      filters: {
        category: {
          slug: {
            $eq: product.category.slug,
          },
        },
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      locale: lang,
      ...draftParams,
    })) ?? []

  const relatedProducts = relatedProductsResponse.filter(p => p.slug !== slug)

  return (
    <ProductDetailClient
      product={product}
      certificatesHeader={productCategoriesPage.certificatesSectionHeader}
      relatedProducts={relatedProducts}
      relatedProductsHeader={productCategoriesPage.relatedProductsSectionHeader}
      enableUserProfile={userProfileEnabled}
      bySellerText={productCategoriesPage.bySellerText}
    />
  )
}
