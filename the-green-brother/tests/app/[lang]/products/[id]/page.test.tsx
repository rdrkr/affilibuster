// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for product detail page server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
  getProductById: jest.fn(),
}))

// Mock next/navigation
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  notFound: (): void => {
    mockNotFound()
  },
}))

// Mock the ProductDetailClient component
jest.mock('@/app/[lang]/products/[id]/ProductDetailClient', () => ({
  __esModule: true,
  default: function MockProductDetailClient({ product, lang }: { product: unknown; lang: CodeEnum }) {
    return <div data-testid="product-detail-client" data-lang={lang} data-has-product={product ? 'true' : 'false'} />
  },
}))

import ProductDetailPage from '@/app/[lang]/products/[id]/page'
import { getProductById } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch product and pass to ProductDetailClient', async () => {
    const mockProduct = { documentId: 'prod-1', content: { header: {} } }
    mockGetProductById.mockResolvedValue(mockProduct as Awaited<ReturnType<typeof getProductById>>)

    const Component = await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, id: 'prod-1' }) })
    render(Component)

    expect(mockGetProductById).toHaveBeenCalledWith('prod-1', { locale: CodeEnum.EN })
    expect(screen.getByTestId('product-detail-client')).toBeInTheDocument()
  })

  it('should call notFound when product is null', async () => {
    mockGetProductById.mockResolvedValue(null)

    await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.EN, id: 'non-existent' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should pass correct language to ProductDetailClient', async () => {
    mockGetProductById.mockResolvedValue({ documentId: 'prod-1' } as Awaited<ReturnType<typeof getProductById>>)

    const Component = await ProductDetailPage({ params: Promise.resolve({ lang: CodeEnum.IT, id: 'prod-1' }) })
    render(Component)

    expect(screen.getByTestId('product-detail-client').getAttribute('data-lang')).toBe(CodeEnum.IT)
  })
})
