// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { getProductById } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

/**
 * Product detail page server component.
 *
 * Fetches a single product by ID from CMS and passes it to the client component.
 * Returns 404 if product not found.
 * @param params - Route parameters containing language code and product ID
 * @param params.params - Promise containing route parameters with lang and id
 * @returns Server-rendered product detail page
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ lang: CodeEnum; id: string }> }) {
  const resolvedParams = await params
  const { lang, id } = resolvedParams

  // Fetch product by ID
  const product = await getProductById(id, { locale: lang })

  // Return 404 if product not found
  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} lang={lang} />
}
