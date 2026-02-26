// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { JsonLdScript } from '@/components/seo'
import { getNavigation, getProductBySlug, getProductCategoriesPage, getProducts } from '@/lib/client'
import { userProfileFlag } from '@/lib/feature-flags'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { buildBreadcrumbJsonLd, buildPageMetadata, buildProductJsonLd } from '@/lib/seo'
import type { BreadcrumbEntry } from '@/lib/seo'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'

/**
 * Generate static params for all product slugs across all languages.
 * @returns Array of { lang, slug } param objects for static generation
 */
export async function generateStaticParams(): Promise<{ lang: string; slug: string }[]> {
  const products = await getProducts({ pagination: { page: 1, pageSize: 100 } })
  if (!products) return []
  return SUPPORTED_LANGUAGE_CODES.flatMap(lang => products.map(product => ({ lang, slug: product.slug })))
}

/**
 * Generate SEO metadata for a product detail page from CMS data.
 * @param root0 - Metadata generation props
 * @param root0.params - Promise containing route parameters with lang and slug
 * @returns Metadata object with title, description, OG, Twitter, and alternates
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: LanguageCode; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const [product, navigation] = await Promise.all([getProductBySlug(slug, { locale: lang }), getNavigation(lang)])
  return buildPageMetadata({
    seoMetadata: product?.seoMetadata,
    lang,
    path: `/products/${slug}`,
    siteName: navigation?.siteTitle,
    ogImageUrl: product?.images[0]?.url,
  })
}

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const productUrl = `${siteUrl}/${lang}/products/${slug}`
  const productName = product.header.header?.text ?? product.slug
  const sellerName = `${product.seller.firstName}${product.seller.lastName ? ` ${product.seller.lastName}` : ''}`

  const productJsonLd = buildProductJsonLd({
    name: productName,
    ...(product.seoMetadata.metaDescription !== undefined ? { description: product.seoMetadata.metaDescription } : {}),
    imageUrls: product.images.map(img => img.url),
    sellerName,
    prices: product.prices.map(p => ({ amount: p.amount, currencyCode: p.currency.code })),
    url: productUrl,
  })

  const breadcrumbs: BreadcrumbEntry[] = [
    { name: 'Home', path: '' },
    { name: product.category.content.text, path: '/products' },
    { name: productName },
  ]

  return (
    <>
      <JsonLdScript data={productJsonLd} />
      <JsonLdScript data={buildBreadcrumbJsonLd(breadcrumbs, lang)} />
      <ProductDetailClient
        product={product}
        certificatesHeader={productCategoriesPage.certificatesSectionHeader}
        relatedProducts={relatedProducts}
        relatedProductsHeader={productCategoriesPage.relatedProductsSectionHeader}
        enableUserProfile={userProfileEnabled}
        bySellerText={productCategoriesPage.bySellerText}
      />
    </>
  )
}
