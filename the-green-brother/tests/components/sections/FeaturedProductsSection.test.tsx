// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for FeaturedProductsSection component
 */

import { render, screen } from '@testing-library/react'

import {
  FeaturedProductsSection,
  type FeaturedProductsSectionProps,
} from '@/components/sections/FeaturedProductsSection'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock components
jest.mock('@/components/elements', () => ({
  Header: function MockHeader({ data }: { data: { header?: { text?: string }; subheader?: { text?: string } } }) {
    return (
      <div data-testid="mock-header">
        <h1>{data.header?.text}</h1>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  ButtonLink: function MockButtonLink({
    data,
    className,
  }: {
    data: { label?: { text?: string }; url: string }
    className?: string
  }) {
    return (
      <a href={data.url} className={className}>
        {data.label?.text}
      </a>
    )
  },
}))

jest.mock('@/components/layout', () => ({
  Carousel: function MockCarousel({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-carousel">{children}</div>
  },
}))

// Mock ProductCard
jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: function MockProductCard({ product, enableUserProfile }: any) {
    return (
      <div data-testid="mock-product-card" data-id={product.id} data-favorites-enabled={enableUserProfile}>
        {product.name}
      </div>
    )
  },
}))

describe('FeaturedProductsSection', () => {
  const mockSectionData: FeaturedProductsSectionProps['data'] = {
    __component: 'sections.featured-products',
    id: 1,
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
      header: {
        text: 'Featured Products',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Featured Products Section',
      },
      subheader: {
        text: 'Subtitle',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        ariaDescription: 'Subtitle',
      },
    },
    viewAllButton: {
      label: {
        text: 'View All',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'View all products',
      },
      url: '/products',
      openInNewTab: false,
    },
    products: [],
  }

  const mockProducts = [
    {
      documentId: 'prod-1',
      id: 1,
      slug: 'eco-bottle',
      name: 'Eco Bottle',
      price: 29.99,
      publishedAt: '2025-01-01',
      images: [],
    } as any,
    {
      documentId: 'prod-2',
      id: 2,
      slug: 'toothbrush',
      name: 'Toothbrush',
      price: 9.99,
      publishedAt: '2025-01-01',
      images: [],
    } as any,
  ]

  const mockSectionDataWithProducts: FeaturedProductsSectionProps['data'] = {
    ...mockSectionData,
    products: mockProducts,
  }

  it('should render section with header and view all button', () => {
    render(
      <FeaturedProductsSection
        direction={DirectionEnum.LTR}
        data={mockSectionDataWithProducts}
        enableUserProfile={false}
      />
    )

    expect(screen.getByText('Featured Products')).toBeInTheDocument()
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('should render carousel with product cards', () => {
    render(
      <FeaturedProductsSection
        direction={DirectionEnum.LTR}
        data={mockSectionDataWithProducts}
        enableUserProfile={false}
      />
    )

    const cards = screen.getAllByTestId('mock-product-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveAttribute('data-id', '1')
    expect(cards[1]).toHaveAttribute('data-id', '2')
  })

  it('should pass enableUserProfile prop to ProductCard', () => {
    render(
      <FeaturedProductsSection
        direction={DirectionEnum.LTR}
        data={mockSectionDataWithProducts}
        enableUserProfile={true}
      />
    )

    const cards = screen.getAllByTestId('mock-product-card')
    expect(cards[0]).toHaveAttribute('data-favorites-enabled', 'true')
  })

  it('should render section with empty aria-label when ariaDescription is undefined', () => {
    const dataWithoutAria: FeaturedProductsSectionProps['data'] = {
      ...mockSectionDataWithProducts,
      header: {
        ...mockSectionDataWithProducts.header,
        header: {
          ...mockSectionDataWithProducts.header.header!,
          ariaDescription: undefined,
        },
      },
    } as unknown as FeaturedProductsSectionProps['data']

    const { container } = render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={dataWithoutAria} enableUserProfile={false} />
    )

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('aria-label', '')
  })

  it('should not render if products list is empty', () => {
    const { container } = render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} enableUserProfile={false} />
    )
    expect(container.firstChild).toBeNull()
  })
})
