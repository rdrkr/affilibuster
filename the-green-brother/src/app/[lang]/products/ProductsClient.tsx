// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Image, Text } from '@/components/elements'
import { PageClient } from '@/components/layout'
import type {
  ApiProductCategoriesPageProductCategoriesPageDocument,
  ApiProductCategoryProductCategoryDocument,
  ApiProductProductDocument,
} from '@/lib/generated/types.gen'

interface ProductsClientProps {
  pageData: ApiProductCategoriesPageProductCategoriesPageDocument | null
  products: ApiProductProductDocument[]
  categories: ApiProductCategoryProductCategoryDocument[]
}

/**
 * Client component for products listing page.
 *
 * Renders products with filtering, sorting, and wishlist functionality.
 * Uses CMS data for all content with graceful degradation.
 * @param props - Component properties
 * @param props.pageData - Page metadata from CMS
 * @param props.products - List of products from CMS
 * @param props.categories - List of product categories from CMS
 * @returns Products listing UI
 */
export default function ProductsClient({ pageData, products, categories }: ProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const router = useRouter()

  /**
   * Handle wishlist button click.
   *
   * Redirects to login if user is not authenticated,
   * otherwise adds product to wishlist.
   * @param e - Click event
   */
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isLoggedIn = localStorage.getItem('isLoggedIn')

    if (!isLoggedIn) {
      router.push('/login')
    } else {
      // Logic to add to wishlist
      console.log('Added to wishlist')
    }
  }

  // Build category filter with "All" option
  const categoryFilters = ['All', ...categories.map(cat => cat.content?.text ?? '')].filter(Boolean)

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category?.content?.text === activeCategory
    const productName = product.content?.header?.header?.text ?? ''
    const matchesSearch = searchQuery === '' || productName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <PageClient>
      {/* Header & Search */}
      <div className="mb-12">
        <h1
          className={`
          mb-6 text-4xl font-bold text-neutral-800 md:text-5xl
          dark:text-white
        `}
        >
          {pageData?.pageText ?? 'Products'}
        </h1>
        {pageData?.seoMetadata?.metaDescription && (
          <p className="mb-6 text-lg text-neutral-600 dark:text-tertiary-300">{pageData.seoMetadata.metaDescription}</p>
        )}
        <div
          className={`
          flex flex-col items-center justify-between gap-4
          md:flex-row
        `}
        >
          <div
            className={`
            relative w-full
            md:max-w-lg
          `}
          >
            <span
              className={`
              material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2
              text-neutral-400 dark:text-tertiary-400
            `}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search sustainable products..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
              }}
              className={`
                w-full rounded-full border border-neutral-200 bg-white
                py-3 pr-4 pl-12 text-neutral-800 transition-all outline-none
                placeholder:text-neutral-400
                focus:border-transparent focus:ring-2 focus:ring-primary-500
                dark:border-tertiary-700 dark:bg-tertiary-800 dark:text-white
                dark:placeholder:text-tertiary-400
              `}
            />
          </div>
          <div
            className={`
            scrollbar-hide flex w-full items-center gap-2 overflow-x-auto pb-2
            md:w-auto md:pb-0
          `}
          >
            <button
              className={`
                flex items-center gap-2 rounded-full border border-neutral-200
                bg-white px-4 py-2 whitespace-nowrap text-neutral-600
                transition-colors hover:border-primary-500 hover:text-primary-600
                dark:border-tertiary-700 dark:bg-tertiary-800 dark:text-white
                dark:hover:border-primary-500
              `}
            >
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filters
            </button>
            <button
              className={`
                flex items-center gap-2 rounded-full border border-neutral-200
                bg-white px-4 py-2 whitespace-nowrap text-neutral-600
                transition-colors hover:border-primary-500 hover:text-primary-600
                dark:border-tertiary-700 dark:bg-tertiary-800 dark:text-white
                dark:hover:border-primary-500
              `}
            >
              Sort By
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categoryFilters.length > 1 && (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-8">
          {categoryFilters.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
              }}
              className={`
                rounded-full px-5 py-2 font-medium whitespace-nowrap
                transition-all
                ${
                  activeCategory === cat
                    ? 'bg-primary-600 font-bold text-white'
                    : `
                    border border-neutral-200 bg-white text-neutral-600
                    hover:border-primary-500 hover:text-primary-600
                    dark:border-tertiary-700 dark:bg-tertiary-800 dark:text-tertiary-400
                    dark:hover:border-primary-500 dark:hover:text-white
                  `
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div
          className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-4
        `}
        >
          {filteredProducts.map(product => {
            const primaryImage = product.images[0]

            return (
              <div
                key={product.documentId}
                className={`
                  group overflow-hidden rounded-xl border border-neutral-200
                  bg-white shadow-lg transition-all duration-300
                  hover:border-primary-500/30
                  dark:border-tertiary-700 dark:bg-tertiary-800
                `}
              >
                <div className="relative h-64 overflow-hidden bg-neutral-100 dark:bg-tertiary-900">
                  <Image
                    image={primaryImage}
                    className={`
                      object-cover transition-transform duration-500
                      group-hover:scale-110
                    `}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <button
                    onClick={handleWishlistClick}
                    className={`
                      absolute top-3 right-3 z-10 rounded-full bg-white/70
                      p-2 text-neutral-600 backdrop-blur-md transition-colors
                      hover:bg-primary-600 hover:text-white
                      dark:bg-tertiary-900/50 dark:text-white
                      dark:hover:bg-primary-600 dark:hover:text-white
                    `}
                  >
                    <span className="material-symbols-outlined block text-xl">favorite_border</span>
                  </button>
                </div>
                <div className="p-5">
                  {product.category?.content?.text && (
                    <Text
                      text={product.category.content.text}
                      as="p"
                      className={`
                        mb-1 text-xs font-bold tracking-wider text-primary-500
                        uppercase
                      `}
                    />
                  )}

                  <Text
                    text={product.content?.header?.header?.text ?? ''}
                    as="h3"
                    className={`
                      mb-2 text-lg font-bold text-neutral-800 transition-colors
                      group-hover:text-primary-500 dark:text-white
                    `}
                  />

                  <div className="mt-4 flex items-center justify-between">
                    {product.price && (
                      <span
                        className={`
                          text-xl font-bold text-neutral-800 dark:text-white
                        `}
                      >
                        ${product.price}
                      </span>
                    )}
                    <button
                      className={`
                        relative z-10 rounded-xl bg-neutral-100 p-2 text-neutral-800
                        transition-colors hover:bg-primary-600 hover:text-white
                        dark:bg-tertiary-700 dark:text-white
                        dark:hover:bg-primary-600 dark:hover:text-white
                      `}
                    >
                      <span className="material-symbols-outlined block text-xl">add_shopping_cart</span>
                    </button>
                  </div>
                  <Link
                    href={`/products/${product.documentId}` as const}
                    className={`
                    absolute inset-0 z-0
                  `}
                  ></Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <span
            className={`
            material-symbols-outlined mb-4 block text-6xl text-neutral-300 dark:text-tertiary-600
          `}
          >
            inventory_2
          </span>
          <p className="text-lg text-neutral-500 dark:text-tertiary-400">No products found</p>
        </div>
      )}
    </PageClient>
  )
}
