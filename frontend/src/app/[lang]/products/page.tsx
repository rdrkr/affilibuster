// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Products Listing Page
 * Shows all products for the current language
 */

import { getProductPage, getProducts } from '@/lib/client'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Button } from '@/components/Button'
import type { ApiProductPageProductPageDocument } from '@/lib/generated/types.gen'
import type { Product } from '@/lib/types'
import { SUPPORTED_LANGUAGE_CODES } from '@/lib/types'

interface Props {
  params: Promise<{ lang: string }>
  searchParams?: Promise<{ page?: string }>
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

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  let products: Product[] = []
  let productsPageData: ApiProductPageProductPageDocument | null = null

  try {
    // Fetch products page metadata
    productsPageData = await getProductPage(lang)

    // Fetch products list
    const productsResponse = await getProducts({
      'pagination[page]': currentPage,
      'pagination[pageSize]': 24,
      locale: lang,
    } as Parameters<typeof getProducts>[0])

    if (productsResponse) {
      products = productsResponse.data
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Don't render error page if CMS data unavailable
    return null
  }

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

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(item => (
              <Link
                key={item.id}
                href={`/${lang}/${item.slug}`}
                className="group border-2 border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-tertiary-400 bg-white dark:bg-neutral-800"
              >
                {/* Placeholder Image */}
                <div className="bg-neutral-200 dark:bg-neutral-700 h-48 flex items-center justify-center">
                  <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-secondary-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3">{item.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination - Only show if CMS button labels available */}
          {currentPage > 1 && productsPageData?.previousButton && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Link href={`/${lang}/products?page=${(currentPage - 1).toString()}`}>
                <Button variant="ghost">{productsPageData.previousButton}</Button>
              </Link>

              <span className="text-sm text-neutral-600 dark:text-neutral-400">Page {currentPage}</span>

              {products.length === 24 && productsPageData.nextButton && (
                <Link href={`/${lang}/products?page=${(currentPage + 1).toString()}`}>
                  <Button variant="ghost">{productsPageData.nextButton}</Button>
                </Link>
              )}
            </div>
          )}

          {/* Pagination Info - Only show if CMS template available */}
          {productsPageData?.showingText && (
            <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {productsPageData.showingText
                .replace('{count}', String(products.length))
                .replace('{total}', String(products.length))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-neutral-600 dark:text-neutral-400">{productsPageData?.noProductsMessage}</p>
        </div>
      )}
    </div>
  )
}
