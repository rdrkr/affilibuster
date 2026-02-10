// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for products page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  getProductCategoriesPage: jest.fn(),
  getProducts: jest.fn(),
  getProductCategories: jest.fn(),
}))

// Mock the feature flags module
jest.mock('@/lib/feature-flags', () => ({
  userProfileFlag: jest.fn().mockResolvedValue(false),
}))

// Mock the ProductsClient component
jest.mock('@/app/[lang]/products/ProductsClient', () => ({
  __esModule: true,
  default: function MockProductsClient(props: {
    products: unknown[]
    categories: unknown[]
    enableUserProfile: boolean
  }) {
    return (
      <div
        data-testid="products-client"
        data-product-count={props.products.length}
        data-category-count={props.categories.length}
        data-enable-user-profile={String(props.enableUserProfile)}
      />
    )
  },
}))

import ProductsPage from '@/app/[lang]/products/page'
import { getProductCategories, getProductCategoriesPage, getProducts } from '@/lib/content'
import { LanguageCode } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductCategoriesPage = getProductCategoriesPage as jest.MockedFunction<typeof getProductCategoriesPage>
const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetProductCategories = getProductCategories as jest.MockedFunction<typeof getProductCategories>

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data and pass to ProductsClient', async () => {
    mockGetProductCategoriesPage.mockResolvedValue({
      documentId: 'page-1',
      id: 1,
      publishedAt: '2025-01-01',
      header: { alignment: 'center', promoteHeaderIcon: false, header: { text: 'Products' } },
      productsFilter: { tagFilter: { allLabel: { text: 'All' } }, priceRangeFilter: {} },
      productsSorter: {
        bestSellers: { text: 'Best Sellers' },
        newArrivals: { text: 'New Arrivals' },
        priceLowToHigh: { text: 'Price: Low to High' },
        priceHighToLow: { text: 'Price: High to Low' },
      },
      pagination: {
        itemsPerPage: 12,
        previousButton: { label: { text: 'Previous' }, url: '#', openInNewTab: false },
        nextButton: { label: { text: 'Next' }, url: '#', openInNewTab: false },
        noItemsFound: { header: { text: 'No products found' } },
      },
    } as unknown as Awaited<ReturnType<typeof getProductCategoriesPage>>)
    mockGetProducts.mockResolvedValue([{ id: 1 }, { id: 2 }] as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue([{ id: 1 }] as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)

    const Component = await ProductsPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(screen.getByTestId('products-client')).toBeInTheDocument()
    expect(screen.getByTestId('products-client').getAttribute('data-product-count')).toBe('2')
    expect(screen.getByTestId('products-client').getAttribute('data-category-count')).toBe('1')
    expect(screen.getByTestId('products-client').getAttribute('data-enable-user-profile')).toBe('false')
  })

  it('should pass empty arrays when responses are null', async () => {
    mockGetProductCategoriesPage.mockResolvedValue(null)
    mockGetProducts.mockResolvedValue(null)
    mockGetProductCategories.mockResolvedValue(null)

    const Component = await ProductsPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(screen.getByTestId('products-client').getAttribute('data-product-count')).toBe('0')
    expect(screen.getByTestId('products-client').getAttribute('data-category-count')).toBe('0')
    expect(screen.getByTestId('products-client').getAttribute('data-enable-user-profile')).toBe('false')
  })

  it('should call APIs with correct locale', async () => {
    mockGetProductCategoriesPage.mockResolvedValue(null)
    mockGetProducts.mockResolvedValue([] as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue([] as Awaited<ReturnType<typeof getProductCategories>>)

    await ProductsPage({ params: Promise.resolve({ lang: LanguageCode.IT }) })

    expect(mockGetProductCategoriesPage).toHaveBeenCalledWith(LanguageCode.IT)
    expect(mockGetProducts).toHaveBeenCalledWith(expect.objectContaining({ locale: LanguageCode.IT }))
  })
})
