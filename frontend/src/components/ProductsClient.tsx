// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Products Client Component
 * Client-side wrapper for interactive product listing features
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CategoryFilter, type Category } from './CategoryFilter'
import { Pagination } from './Pagination'
import type { Product } from '@/lib/types'

export interface ProductsClientProps {
  /**
   * Array of products to display
   */
  products: Product[]
  /**
   * Current language code
   */
  lang: string
  /**
   * Current page number
   */
  currentPage: number
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Available categories
   */
  categories: Category[]
  /**
   * Currently selected category ID
   */
  selectedCategory: string | null
}

/**
 * Client component for product listing with category filtering and pagination.
 * Handles client-side navigation for category selection and page changes.
 *
 * @param props - ProductsClient component props
 * @returns Rendered product grid with filters
 */
export function ProductsClient({
  products,
  lang,
  currentPage,
  totalPages,
  categories,
  selectedCategory,
}: ProductsClientProps): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    params.delete('page') // Reset to page 1 when changing category
    router.push(`/${lang}/products?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/${lang}/products?${params.toString()}`)
  }

  return (
    <>
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            allCategoriesLabel="All Categories"
          />
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(item => (
              <Link
                key={item.id}
                href={`/${lang}/products/${item.slug}`}
                className="group border-2 border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-tertiary-400 bg-white dark:bg-neutral-800"
                data-testid="product-card"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-neutral-600 dark:text-neutral-400">No products found</p>
        </div>
      )}
    </>
  )
}
