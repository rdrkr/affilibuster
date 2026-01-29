// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { ButtonAction, Header, Icon, Label, TabbedView, Text, type Tab } from '@/components/elements'
import { PageClient } from '@/components/layout'
import { SortMenu, type SortOption } from '@/components/menus'
import { ProductsGrid } from '@/components/product'
import { useLayoutContext } from '@/components/providers'
import {
  type ApiProductCategoriesPageProductCategoriesPageDocument,
  type ApiProductCategoryProductCategoryDocument,
  type ApiProductProductDocument,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductsClient component
 */
interface ProductsClientProps {
  /** Page metadata from CMS */
  pageData: ApiProductCategoriesPageProductCategoriesPageDocument | null
  /** List of products from CMS */
  products: ApiProductProductDocument[]
  /** List of product categories from CMS */
  categories: ApiProductCategoryProductCategoryDocument[]
  /** Feature flag: Enable user profile features (favorites) */
  enableUserProfile: boolean
}

/**
 * Sorts products based on the selected sort option.
 * @param products - Products to sort
 * @param sortBy - Sort option key
 * @returns Sorted products array
 */
function sortProducts(products: ApiProductProductDocument[], sortBy: SortOption): ApiProductProductDocument[] {
  return [...products].sort((a, b) => {
    const priceA = a.prices[0]?.amount ?? 0
    const priceB = b.prices[0]?.amount ?? 0

    switch (sortBy) {
      case 'priceLowToHigh':
        return priceA - priceB
      case 'priceHighToLow':
        return priceB - priceA
      case 'newArrivals':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'bestSellers':
      default:
        // Keep original order (assumes backend sorts by popularity)
        return 0
    }
  })
}

/**
 * Client component for products listing page.
 *
 * Renders products with category filtering, sorting, and responsive grid layout.
 * Uses CMS data for all content with graceful handling of missing data.
 * @param props - Component properties
 * @param props.pageData - Page metadata from CMS
 * @param props.products - List of products from CMS
 * @param props.categories - List of product categories from CMS
 * @param props.enableUserProfile - Feature flag: Enable user profile features (favorites)
 * @returns Products listing UI or null if no CMS data
 */
export default function ProductsClient({ pageData, products, categories, enableUserProfile }: ProductsClientProps) {
  const { direction } = useLayoutContext()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Use URL params directly as source of truth for category and search
  const activeCategory = searchParams.get('category') ?? 'all'
  const searchTerm = searchParams.get('search') ?? ''

  // State for sorting (not in URL)
  const [sortBy, setSortBy] = useState<SortOption>('bestSellers')

  // Create virtual "All" category and combine with real categories, filtered to only include renderable ones
  const renderableCategoriesCollection = useMemo(() => {
    const allCategory: Partial<ApiProductCategoryProductCategoryDocument> = {
      documentId: 'all',
      slug: 'all',
    }
    // Filter to only include categories that will be rendered (those with text or the "All" category)
    const filteredCategories = categories.filter(cat => cat.content.text)
    return [allCategory as ApiProductCategoryProductCategoryDocument, ...filteredCategories]
  }, [categories])

  /**
   * Updates URL params for category and search.
   * @param category - The category slug ('all' excludes it from URL)
   * @param search - The search term (empty excludes it from URL)
   */
  const updateUrlParams = (category: string, search: string) => {
    const params = new URLSearchParams()
    if (category && category !== 'all') {
      params.set('category', category)
    }
    if (search) {
      params.set('search', search)
    }
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  // Early return if no CMS data
  if (!pageData) return null

  // Destructure CMS data
  const { header, productsFilter, productsSorter, pagination } = pageData

  // Create category tabs array for TabbedView
  const categoryTabs: Tab[] = renderableCategoriesCollection.map(category => ({
    key: category.slug,
    label:
      category.documentId === 'all' ? (
        <Label data={productsFilter.tagFilter.allLabel} direction={direction} display="inline" />
      ) : (
        category.content.text
      ),
    content: null, // Content handled externally via showPanel=false
  }))

  // Filter products by category and search term
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category.slug === activeCategory
    if (searchTerm === '') {
      return matchesCategory
    }
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = p.header.header?.text.toLowerCase().includes(searchTermLower) ?? false
    return matchesCategory && matchesSearch
  })

  // Sort products
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  /**
   * Handle sort option selection
   * @param option - Selected sort option key
   */
  const handleSortSelect = (option: SortOption) => {
    setSortBy(option)
  }

  /**
   * Handle category selection - updates URL params.
   * @param categorySlug - Category slug ('all' for all categories, or specific category slug)
   */
  const handleCategorySelect = (categorySlug: string) => {
    updateUrlParams(categorySlug, searchTerm)
  }

  /**
   * Clear the search term - updates URL params.
   */
  const handleClearSearch = () => {
    updateUrlParams(activeCategory, '')
  }

  return (
    <PageClient childrenClassName="gap-2!">
      {/* Page Header */}
      <Header data={header} level={1} direction={direction} />

      {/* Controls: Category Filter + Sort using TabbedView */}
      <TabbedView
        tabs={categoryTabs}
        activeKey={activeCategory}
        onTabChange={handleCategorySelect}
        direction={direction}
        carouselGap="sm"
        showPanel={false}
        className="mt-6"
        afterTabBar={
          /* Active Filters Row: Search Term + Sort */
          <div className="flex items-center justify-between gap-2">
            {/* Active Search Term Display */}
            {searchTerm && (
              <ButtonAction
                direction={direction}
                variant="ghost-1"
                size="sm"
                onClick={handleClearSearch}
                data-testid="clear-search-button"
              >
                <Text text={searchTerm} className="text-neutral-600 dark:text-neutral-300" />
                <Icon icon="close" size="sm" />
              </ButtonAction>
            )}

            {/* Spacer when no search term */}
            {!searchTerm && <div />}

            {/* Sort Dropdown */}
            <SortMenu
              data={productsSorter}
              className="flex justify-end"
              sortBy={sortBy}
              onSortChange={handleSortSelect}
              direction={direction}
            />
          </div>
        }
      />

      {/* Product Grid */}
      <ProductsGrid
        products={sortedProducts}
        direction={direction}
        pagination={pagination}
        enableUserProfile={enableUserProfile}
      />
    </PageClient>
  )
}
