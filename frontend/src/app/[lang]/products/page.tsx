// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Products Listing Page
 * Shows all products for the current language
 */

import { contentAPI } from '@/lib/api'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ lang: string }>
  searchParams?: Promise<{ page?: string }>
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'he' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang = 'en' } = await params

  try {
    const response = await contentAPI.getSingleType(lang, 'product-page')
    const productsPageData = response?.data || response

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
    if (resolvedParams?.lang) {
      lang = resolvedParams.lang
    }
  } catch (e) {
    console.error('Failed to resolve params:', e)
  }

  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams?.page) || 1

  // Enable static rendering
  if (lang) {
    setRequestLocale(lang)
  }

  let content: unknown
  let productsPageData: unknown = null

  try {
    // Fetch products page metadata and content
    const pageResponse = await contentAPI.getSingleType(lang, 'product-page')
    productsPageData = pageResponse?.data || pageResponse

    // Fetch products list
    content = await contentAPI.list(lang, currentPage, 24)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Don't render error page if CMS data unavailable
    return null
  }

  // Filter to only show products (not pages)
  const products = content.data.filter((item: unknown) => item.type === 'product')

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
            {products.map((item: unknown) => (
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
          {content.pagination.totalPages > 1 && productsPageData?.previousButton && productsPageData?.nextButton && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {/* Previous Button */}
              {content.pagination.hasPrevious && (
                <Link
                  href={`/${lang}/products?page=${currentPage - 1}`}
                  className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {productsPageData.previousButton}
                </Link>
              )}

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {Array.from({ length: content.pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and 2 pages around current
                    return page === 1 || page === content.pagination.totalPages || Math.abs(page - currentPage) <= 2
                  })
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center gap-2">
                      {/* Show ellipsis if there's a gap */}
                      {index > 0 && page - array[index - 1] > 1 && <span className="text-neutral-400">...</span>}

                      <Link
                        href={`/${lang}/products?page=${page}`}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          page === currentPage
                            ? 'bg-secondary-600 text-white border-secondary-600'
                            : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {page}
                      </Link>
                    </div>
                  ))}
              </div>

              {/* Next Button */}
              {content.pagination.hasNext && (
                <Link
                  href={`/${lang}/products?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {productsPageData.nextButton}
                </Link>
              )}
            </div>
          )}

          {/* Pagination Info - Only show if CMS templates available */}
          {productsPageData?.showingText && (
            <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {productsPageData.showingText
                .replace('{count}', String(products.length))
                .replace('{total}', String(content.pagination.totalItems))}
              {content.pagination.totalPages > 1 && productsPageData?.pageText && (
                <>
                  {' '}
                  ·{' '}
                  {productsPageData.pageText
                    .replace('{current}', String(currentPage))
                    .replace('{total}', String(content.pagination.totalPages))}
                </>
              )}
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

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60 // Revalidate every 60 seconds
