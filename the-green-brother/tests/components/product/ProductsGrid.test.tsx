// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { ProductsGrid } from '@/components/product/ProductsGrid'
import { DirectionEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

// Mock ProductCard
jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: { documentId: string; title: string } }) => (
    <div data-testid="product-card">{product.title}</div>
  ),
}))

// Mock Header
jest.mock('@/components/elements/Header', () => ({
  Header: ({ data }: { data: { header: { text: string } } }) => <div data-testid="header">{data.header.text}</div>,
}))

// Mock Icon
jest.mock('@/components/elements/Icon', () => ({
  Icon: ({ icon }: { icon: string }) => <div data-testid="icon">{icon}</div>,
}))

const mockPagination = {
  page: 1,
  pageSize: 10,
  pageCount: 1,
  total: 5,
  noItemsFound: {
    header: {
      text: 'No items found',
      icon: 'search_off',
      iconPosition: 'before_text',
      ariaDescription: 'No items found',
    },
  },
}

const mockProducts = [
  { documentId: '1', title: 'Product 1', prices: [{ amount: 10 }] },
  { documentId: '2', title: 'Product 2', prices: [{ amount: 20 }] },
] as any[]

describe('ProductsGrid', () => {
  it('renders product cards when products are provided', () => {
    render(
      <ProductsGrid
        products={mockProducts}
        direction={DirectionEnum.LTR}
        pagination={mockPagination as any}
        enableUserProfile={false}
      />
    )

    const cards = screen.getAllByTestId('product-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Product 1')
    expect(cards[1]).toHaveTextContent('Product 2')
  })

  it('renders empty state when no products are provided', () => {
    render(
      <ProductsGrid
        products={[]}
        direction={DirectionEnum.LTR}
        pagination={mockPagination as any}
        enableUserProfile={false}
      />
    )

    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument()
    expect(screen.getByTestId('header')).toHaveTextContent('No items found')
    expect(screen.getByTestId('icon')).toHaveTextContent('search_off')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ProductsGrid
        products={mockProducts}
        direction={DirectionEnum.LTR}
        pagination={mockPagination as any}
        className="custom-class"
        enableUserProfile={false}
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
