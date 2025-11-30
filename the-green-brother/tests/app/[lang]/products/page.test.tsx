// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for products page server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
  getProductCategoriesPage: jest.fn(),
  getProducts: jest.fn(),
  getProductCategories: jest.fn(),
}))

// Mock the ProductsClient component
jest.mock('@/app/[lang]/products/ProductsClient', () => ({
  __esModule: true,
  default: function MockProductsClient(props: { products: unknown[]; categories: unknown[] }) {
    return (
      <div
        data-testid="products-client"
        data-product-count={props.products.length}
        data-category-count={props.categories.length}
      />
    )
  },
}))

import ProductsPage from '@/app/[lang]/products/page'
import { getProductCategories, getProductCategoriesPage, getProducts } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductCategoriesPage = getProductCategoriesPage as jest.MockedFunction<typeof getProductCategoriesPage>
const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetProductCategories = getProductCategories as jest.MockedFunction<typeof getProductCategories>

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data and pass to ProductsClient', async () => {
    mockGetProductCategoriesPage.mockResolvedValue({ pageText: 'Products' } as Awaited<
      ReturnType<typeof getProductCategoriesPage>
    >)
    mockGetProducts.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }], meta: {} } as Awaited<
      ReturnType<typeof getProducts>
    >)
    mockGetProductCategories.mockResolvedValue({ data: [{ id: 1 }], meta: {} } as Awaited<
      ReturnType<typeof getProductCategories>
    >)

    const Component = await ProductsPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('products-client')).toBeInTheDocument()
    expect(screen.getByTestId('products-client').getAttribute('data-product-count')).toBe('2')
    expect(screen.getByTestId('products-client').getAttribute('data-category-count')).toBe('1')
  })

  it('should pass empty arrays when responses are null', async () => {
    mockGetProductCategoriesPage.mockResolvedValue(null)
    mockGetProducts.mockResolvedValue(null)
    mockGetProductCategories.mockResolvedValue(null)

    const Component = await ProductsPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('products-client').getAttribute('data-product-count')).toBe('0')
    expect(screen.getByTestId('products-client').getAttribute('data-category-count')).toBe('0')
  })

  it('should call APIs with correct locale', async () => {
    mockGetProductCategoriesPage.mockResolvedValue(null)
    mockGetProducts.mockResolvedValue({ data: [], meta: {} } as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [], meta: {} } as Awaited<
      ReturnType<typeof getProductCategories>
    >)

    await ProductsPage({ params: Promise.resolve({ lang: CodeEnum.IT }) })

    expect(mockGetProductCategoriesPage).toHaveBeenCalledWith(CodeEnum.IT)
    expect(mockGetProducts).toHaveBeenCalledWith(expect.objectContaining({ locale: CodeEnum.IT }))
  })
})
