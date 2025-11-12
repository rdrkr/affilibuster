// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Products Listing Page
 * Shows all products for the current language
 */

import { getProductPage, getProducts } from '@/lib/client'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { ProductsClient } from '@/components/ProductsClient'
import type { Category } from '@/components/CategoryFilter'
import type { ApiProductPageProductPageDocument, Pagination } from '@/lib/generated/types.gen'
import type { Product } from '@/lib/types'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'

interface Props {
  params: Promise<{ lang: string }>
  searchParams?: Promise<{ page?: string; category?: string }>
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGE_CODES.map(lang => ({ lang }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  try {
    const productsPageData = await getProductPage(lang)

    return {
      title: productsPageData?.metaTitle,
      description: productsPageData?.metaDescription,
    }
  } catch (error) {
    console.error('Failed to fetch products page metadata:', error)
    return {
      title: undefined,
      description: undefined,
    }
  }
}

export default async function ProductsPage({ params, searchParams }: Props) {
  let lang = 'en'
  try {
    const resolvedParams = await params
    if (resolvedParams.lang) {
      lang = resolvedParams.lang
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  const resolvedSearchParams = await searchParams
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1
  const selectedCategory = resolvedSearchParams?.category ?? null

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  let products: Product[] = []
  let productsPageData: ApiProductPageProductPageDocument | null = null
  let totalPages = 1

  try {
    // Fetch products page metadata
    productsPageData = await getProductPage(lang)

    // Fetch products list
    const productsResponse = await getProducts({
      'pagination[page]': currentPage,
      'pagination[pageSize]': 2, // Small page size for testing pagination
      locale: lang,
    } as Parameters<typeof getProducts>[0])

    if (productsResponse) {
      products = productsResponse.data
      // Get total pages from API metadata using generated Pagination type
      // Meta is generically typed, so we need to assert the pagination property type
      const pagination = productsResponse.meta?.pagination as Pagination | undefined
      totalPages = pagination?.totalPages ?? 1
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Don't render error page if CMS data unavailable
    return null
  }

  // Mock categories for now - TODO: Fetch from CMS
  const categories: Category[] = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports & Outdoors' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {productsPageData?.title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{productsPageData.title}</h1>}
        {productsPageData?.subtitle && (
          <p className="text-xl text-neutral-600 dark:text-neutral-400">{productsPageData.subtitle}</p>
        )}
        {productsPageData?.description && (
          <div
            className="mt-4 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: productsPageData.description }}
          />
        )}
      </div>

      {/* Products Grid with Filters and Pagination */}
      <ProductsClient
        products={products}
        lang={lang}
        currentPage={currentPage}
        totalPages={totalPages}
        categories={categories}
        selectedCategory={selectedCategory}
      />
    </div>
  )
}
