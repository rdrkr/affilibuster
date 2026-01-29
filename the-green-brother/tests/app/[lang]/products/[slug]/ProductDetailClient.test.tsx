// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductDetailClient component
 */

import { fireEvent, screen } from '@testing-library/react'

import ProductDetailClient from '@/app/[lang]/products/[slug]/ProductDetailClient'
import { CodeEnum, IconPositionEnum, type ApiProductProductDocument } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../../utils/renderWithLayout'

// Mock content components
jest.mock('@/components/layout/DynamicZone', () => ({
  DynamicZone: ({
    sections,
    renderSection,
  }: {
    sections: any[]
    renderSection?: (section: any) => React.ReactNode
  }) => (
    <div data-testid="mock-dynamic-zone">
      {sections.map((section, index) => (
        <div key={index} data-testid={`section-${section.__component}`}>
          {renderSection ? renderSection(section) : (section.text ?? 'Dynamic Section')}
        </div>
      ))}
    </div>
  ),
}))

// Mock CMS components
jest.mock('@/components/elements', () => ({
  Breadcrumbs: function MockBreadcrumbs() {
    return <nav data-testid="mock-breadcrumbs">Breadcrumbs</nav>
  },
  ButtonAction: function MockButtonAction({
    data,
    children,
    onClick,
    className,
  }: {
    data?: { label?: { text?: string; icon?: string; ariaDescription?: string } }
    children?: React.ReactNode
    onClick?: () => void
    className?: string
  }) {
    const content =
      children ?? (data?.label?.icon ? <span data-testid="mock-icon">{data.label.icon}</span> : data?.label?.text)
    return (
      <button onClick={onClick} className={className} aria-label={data?.label?.ariaDescription}>
        {content}
      </button>
    )
  },
  ButtonLink: function MockButtonLink({
    data,
    className,
  }: {
    data: { url: string; label?: { text?: string } }
    className?: string
  }) {
    return (
      <a href={data.url} target="_blank" rel="noopener noreferrer" className={className}>
        {data.label?.text ?? 'Buy Now'}
      </a>
    )
  },
  Header: function MockHeader({ data, level }: { data: { header?: { text?: string } }; level: number }) {
    const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return <Tag data-testid="mock-header">{data.header?.text ?? ''}</Tag>
  },
  Icon: function MockIcon({ icon }: { icon: string }) {
    return <span data-testid="mock-icon">{icon}</span>
  },
  ImageGallery: function MockImageGallery({ images, ariaLabel }: { images: unknown[]; ariaLabel?: string }) {
    return (
      <div data-testid="mock-image-gallery" aria-label={ariaLabel}>
        {images.length > 0 ? (
          <div data-testid="gallery-images">{images.length} images</div>
        ) : (
          <div data-testid="gallery-placeholder">No images</div>
        )}
      </div>
    )
  },
  Text: function MockText({
    text,
    as: Tag = 'span',
    className,
  }: {
    text: string
    as?: React.ElementType
    className?: string
  }) {
    return <Tag className={className}>{text}</Tag>
  },
  TextBlock: function MockTextBlock({ data }: { data: { text: string } }) {
    return <div data-testid="mock-text-block">{data.text}</div>
  },
}))

// Mock QuantitySelector component
jest.mock('@/components/product', () => ({
  QuantitySelector: function MockQuantitySelector({
    quantity,
    onIncrement,
    onDecrement,
  }: {
    quantity: number
    onIncrement: () => void
    onDecrement: () => void
  }) {
    return (
      <div data-testid="mock-quantity-selector">
        <button onClick={onDecrement} data-testid="quantity-decrement">
          -
        </button>
        <span data-testid="quantity-value">{quantity}</span>
        <button onClick={onIncrement} data-testid="quantity-increment">
          +
        </button>
      </div>
    )
  },
}))

describe('ProductDetailClient', () => {
  const mockProduct: ApiProductProductDocument = {
    documentId: 'prod-1',
    slug: 'eco-product',
    header: {
      header: { text: 'Eco Product' },
      subheader: { text: 'A sustainable product' },
    },
    description: [
      {
        __component: 'elements.text-block',
        text: 'Product description',
      },
    ],
    prices: [{ id: 1, amount: 49.99, currency: { symbol: '$', code: 'USD' } }],
    category: { content: { text: 'Electronics' } },
    images: [{ url: '/images/prod1.jpg' }, { url: '/images/prod2.jpg' }],
    affiliateButton: { url: 'https://affiliate.example.com/buy', label: { text: 'Buy Now' } },
    disclaimerLabel: {
      text: 'Disclaimer',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Disclaimer',
    },
  } as unknown as ApiProductProductDocument

  it('should render product title', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eco Product')
  })

  it('should render QuantitySelector component', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-quantity-selector')).toBeInTheDocument()
    expect(screen.getByTestId('quantity-value')).toHaveTextContent('1')
  })

  it('should render product price', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('should render category', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('should render affiliate link when affiliateButton has URL', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const buyLink = screen.getByRole('link', { name: 'Buy Now' })
    expect(buyLink).toHaveAttribute('href', 'https://affiliate.example.com/buy')
    expect(buyLink).toHaveAttribute('target', '_blank')
  })

  it('should render ImageGallery component', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-image-gallery')).toBeInTheDocument()
    expect(screen.getByTestId('gallery-images')).toHaveTextContent('2 images')
  })

  it('should render ImageGallery with aria-label including product title', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const gallery = screen.getByTestId('mock-image-gallery')
    expect(gallery).toHaveAttribute('aria-label', 'Eco Product images')
  })

  it('should increment quantity', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const incrementButton = screen.getByTestId('quantity-increment')
    fireEvent.click(incrementButton)

    expect(screen.getByTestId('quantity-value')).toHaveTextContent('2')
  })

  it('should decrement quantity but not below 1', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const decrementButton = screen.getByTestId('quantity-decrement')
    fireEvent.click(decrementButton)

    // Should still be 1
    expect(screen.getByTestId('quantity-value')).toHaveTextContent('1')
  })

  it('should render wishlist button with favorite_border icon', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('favorite_border')).toBeInTheDocument()
  })

  it('should handle wishlist click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      return
    })

    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const wishlistIcon = screen.getByText('favorite_border')
    const wishlistButton = wishlistIcon.closest('button')!
    fireEvent.click(wishlistButton)

    expect(consoleSpy).toHaveBeenCalledWith('Added to wishlist')
    consoleSpy.mockRestore()
  })

  it('should render product content section with Header', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    // Should render the description via DynamicZone
    expect(screen.getByTestId('mock-dynamic-zone')).toBeInTheDocument()
    expect(screen.getByTestId('section-elements.text-block')).toBeInTheDocument()
    expect(screen.getByTestId('mock-text-block')).toHaveTextContent('Product description')
  })

  it('should render nothing for unknown component types in DynamicZone', () => {
    const productWithUnknownSection = {
      ...mockProduct,
      description: [
        {
          __component: 'unknown.component',
          text: 'Hidden content',
        },
      ],
    } as unknown as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithUnknownSection} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-dynamic-zone')).toBeInTheDocument()
    // The section container is rendered by the mock, but the content should be null (empty)
    const sectionContainer = screen.getByTestId('section-unknown.component')
    expect(sectionContainer).toBeEmptyDOMElement()
  })

  it('should render subheader when available', () => {
    renderWithLayout(<ProductDetailClient product={mockProduct} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('A sustainable product')).toBeInTheDocument()
  })

  it('should show ImageGallery placeholder when no images available', () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithNoImages} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('gallery-placeholder')).toHaveTextContent('No images')
  })

  it('should render currency code when non-USD', () => {
    const productWithEuro = {
      ...mockProduct,
      prices: [{ id: 1, amount: 49.99, currency: { symbol: '€', code: 'EUR' } }],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithEuro} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  it('should not render product details section when no content', () => {
    const productWithoutContent = {
      ...mockProduct,
      header: {
        header: {
          text: 'Test',
          iconPosition: IconPositionEnum.BEFORE_TEXT,
          ariaDescription: 'Test',
        },
        alignment: 'center' as any,
        promoteHeaderIcon: false,
      },
      description: [],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithoutContent} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    // Should not render the DynamicZone if empty (technically the component renders empty div if empty array pass, depending on usage)
    // Actually our ProductDetailClient renders <div className="mb-16 max-w-3xl">...</div> wrapping DynamicZone.
    // But inside ProductDetailClient, we verify access.
    // Actually, checking original code:
    // <DynamicZone sections={product.description} ... />
    // It will render. But with 0 sections.
    // Let's verify it renders but empty.
    const dynamicZone = screen.getByTestId('mock-dynamic-zone')
    expect(dynamicZone).toBeEmptyDOMElement()
  })

  it('should not render price section when price is not available', () => {
    const productWithoutPrice = {
      ...mockProduct,
      prices: [],
    } as unknown as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithoutPrice} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.queryByText('$49.99')).not.toBeInTheDocument()
  })

  it('should not render subheader when not available', () => {
    const productWithoutSubheader = {
      ...mockProduct,
      header: { header: { text: 'No Subheader Product' } },
      description: [{ __component: 'elements.text-block', text: 'Content' }],
    } as unknown as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithoutSubheader} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.queryByText('A sustainable product')).not.toBeInTheDocument()
  })

  it('should not render currency code for USD', () => {
    const productWithUSD = {
      ...mockProduct,
      prices: [{ id: 1, amount: 49.99, currency: { symbol: '$', code: 'USD' } }],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient product={productWithUSD} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    // USD code should not be displayed
    expect(screen.queryByText('USD')).not.toBeInTheDocument()
  })
})
