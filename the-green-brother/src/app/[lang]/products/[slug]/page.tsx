// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getProductBySlug, getProductCategoriesPage } from '@/lib/client'
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
  const [product, productCategoriesPage] = await Promise.all([
    getProductBySlug(slug, { locale: lang }),
    getProductCategoriesPage(lang),
  ])

  // Return 404 if product not found
  if (!product || !productCategoriesPage) {
    notFound()
  }

  return <ProductDetailClient product={product} certificatesHeader={productCategoriesPage.certificatesSectionHeader} />
}
