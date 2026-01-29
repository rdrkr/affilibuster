// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { ProductCard } from '@/components/product/ProductCard'
import { DirectionEnum, IconPositionEnum, type ApiProductProductDocument } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

/**
 * Unit tests for ProductCard component
 */

// Mock Card component
jest.mock('@/components/elements/Card', () => ({
  Card: jest.fn(
    ({ direction, asLink, href, image, imageOverlay, header, content, footer, className, size, layout }) => (
      <div
        data-testid="mock-card"
        data-direction={direction}
        data-as-link={asLink}
        data-href={href}
        data-size={size}
        data-layout={layout}
        className={className}
      >
        <div data-testid="mock-image">
          {image ? <img src={image.url} alt={image.alternativeText} /> : 'Placeholder'}
        </div>
        <div data-testid="mock-overlay">{imageOverlay}</div>
        <div data-testid="mock-header">{header}</div>
        <div data-testid="mock-content">{content}</div>
        <div data-testid="mock-footer">{footer}</div>
      </div>
    )
  ),
}))

// Mock ButtonLink
jest.mock('@/components/elements', () => ({
  ...jest.requireActual('@/components/elements'),
  ButtonLink: jest.fn(({ data }) => (
    <a href={data.url} data-testid="mock-button-link">
      {data.label?.text}
    </a>
  )),
  Text: jest.fn(({ text }) => <span>{text}</span>),
  Icon: jest.fn(({ icon }) => <span data-testid="mock-icon" data-icon={icon} />),
}))

describe('ProductCard', () => {
  const mockProduct: ApiProductProductDocument = {
    documentId: 'prod-1',
    id: 1,
    slug: 'eco-bottle',
    prices: [
      {
        id: 1,
        amount: 25.5,
        currency: {
          documentId: 'curr-1',
          id: 1,
          code: 'USD',
          symbol: '$',
          name: 'Dollar',
          decimalPlaces: 2,
          symbolPosition: 'before',
          thousandsSeparator: ',',
          decimalSeparator: '.',
          publishedAt: '2025-01-01',
        } as any,
      },
    ],
    images: [
      {
        documentId: 'img-1',
        id: 1,
        url: '/images/bottle.jpg',
        alternativeText: 'Bottle Image',
        name: 'bottle.jpg',
        hash: 'bottle',
        mime: 'image/jpeg',
        size: 100,
        provider: 'local',
        publishedAt: '2025-01-01',
      },
    ],
    tags: [
      {
        id: 1,
        documentId: 'tag-1',
        tagId: 'new-arrival',
        publishedAt: '2025-01-01',
        tag: {
          id: 1,
          text: 'New Arrival',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'New arrival tag',
        },
        seoMetadata: {
          metaTitle: 'New Arrival',
          metaDescription: 'New arrival products',
        },
      },
    ],
    header: {
      alignment: 'center',
      promoteHeaderIcon: false,
      header: {
        text: 'Eco Water Bottle',
        ariaDescription: 'Product Title',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
    } as any,
    viewDetailsLabel: {
      text: 'See Details',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'View details',
    },
    affiliateButton: {
      label: {
        text: 'Buy Now',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'Buy on affiliate site',
      },
      url: 'https://example.com',
      openInNewTab: true,
    },
    disclaimerLabel: {
      text: 'Disclaimer',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Disclaimer',
    },
    category: {
      documentId: 'cat-1',
      slug: 'electronics',
      content: { text: 'Electronics' },
    } as any,
    description: [],
    seller: { documentId: 'seller-1' } as any,
    seoMetadata: {
      metaTitle: 'Eco Water Bottle',
      metaDescription: 'Sustainable electronic bottle',
    },
    publishedAt: '2025-01-01',
  }

  const defaultProps = {
    product: mockProduct,
    direction: DirectionEnum.LTR,
    enableUserProfile: false,
  }

  it('should render generic Card with correct props', () => {
    render(<ProductCard {...defaultProps} />)
    const card = screen.getByTestId('mock-card')

    expect(card).toHaveAttribute('data-direction', 'ltr')
    expect(card).toHaveAttribute('data-href', '/products/eco-bottle')
    expect(card).toHaveAttribute('data-size', 'md')
    expect(card).toHaveAttribute('data-layout', 'ttb') // Default
  })

  it('should accept custom layout prop', () => {
    render(<ProductCard {...defaultProps} layout="ltr" />)
    const card = screen.getByTestId('mock-card')
    expect(card).toHaveAttribute('data-layout', 'ltr')
  })

  it('should render product image', () => {
    render(<ProductCard {...defaultProps} />)
    const img = screen.getByAltText('Bottle Image')
    expect(img).toHaveAttribute('src', '/images/bottle.jpg')
  })

  it('should render price formatted correctly', () => {
    render(<ProductCard {...defaultProps} />)
    expect(screen.getByText('$25.50')).toBeInTheDocument()
  })

  it('should render tag if present', () => {
    render(<ProductCard {...defaultProps} />)
    expect(screen.getByText('New Arrival')).toBeInTheDocument()
  })

  it('should render title from content header', () => {
    render(<ProductCard {...defaultProps} />)
    expect(screen.getByText('Eco Water Bottle')).toBeInTheDocument()
  })

  it('should render footer CTA', () => {
    render(<ProductCard {...defaultProps} />)
    expect(screen.getByText('See Details')).toBeInTheDocument()
  })

  it('should NOT render favorite button by default', () => {
    render(<ProductCard {...defaultProps} />)
    const overlay = screen.getByTestId('mock-overlay')
    expect(overlay).toBeEmptyDOMElement()
  })

  it('should render favorite button when enabled', () => {
    render(<ProductCard {...defaultProps} enableUserProfile={true} />)
    const overlay = screen.getByTestId('mock-overlay')
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveAttribute('data-icon', 'favorite_border')
    expect(overlay).toContainElement(icon)
  })

  it('should handle empty prices array gracefully', () => {
    const productNoPrices = {
      ...mockProduct,
      prices: [],
    }
    render(<ProductCard {...defaultProps} product={productNoPrices as any} />)
    // Price should not be displayed
    expect(screen.queryByText('$25.50')).not.toBeInTheDocument()
  })

  it('should handle missing tags gracefully', () => {
    const productNoTags = {
      ...mockProduct,
      tags: [],
    }
    render(<ProductCard {...defaultProps} product={productNoTags} />)
    // Price should still be there
    expect(screen.getByText('$25.50')).toBeInTheDocument()
    // Tag should not be
    expect(screen.queryByText('New Arrival')).not.toBeInTheDocument()
  })
})
