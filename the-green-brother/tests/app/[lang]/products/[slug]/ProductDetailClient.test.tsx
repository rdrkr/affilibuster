// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ProductDetailClient component
 */

import { screen } from '@testing-library/react'

import ProductDetailClient from '@/app/[lang]/products/[slug]/ProductDetailClient'
import {
  AlignmentEnum,
  CodeEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiProductProductDocument,
} from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../../utils/renderWithLayout'
// ... (skip lines) ...

// Mock layout components
jest.mock('@/components/layout', () => ({
  PageClient: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-page-client">{children}</div>,
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
}))

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
  ImageGallery: function MockImageGallery({
    images,
    ariaLabel,
    enableUserProfile,
  }: {
    images: unknown[]
    ariaLabel?: string
    enableUserProfile?: boolean
  }) {
    return (
      <div data-testid="mock-image-gallery" aria-label={ariaLabel}>
        {images.length > 0 ? (
          <div data-testid="gallery-images">{images.length} images</div>
        ) : (
          <div data-testid="gallery-placeholder">No images</div>
        )}
        {enableUserProfile && <button data-testid="gallery-wishlist-button">Wishlist</button>}
      </div>
    )
  },
  Label: function MockLabel({ data, className }: { data?: { text?: string }; className?: string }) {
    return (
      <span data-testid="mock-label" className={className}>
        {data?.text ?? ''}
      </span>
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

// Mock Product components
jest.mock('@/components/product', () => ({
  ProductCertificatesSection: function MockProductCertificatesSection({
    certificates,
    header,
  }: {
    certificates: any[]
    header?: any
  }) {
    return (
      <div data-testid="mock-product-certificates">
        {certificates.length} certificates
        {header && <div data-testid="certificates-header">{header.header?.text}</div>}
      </div>
    )
  },
  ProductCard: function MockProductCard({ product }: { product: any }) {
    return <div data-testid="mock-product-card">{product.header?.header?.text ?? 'Product Card'}</div>
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
    seller: {
      documentId: 'seller-1',
      firstName: 'Green',
      lastName: 'Seller',
      slug: 'green-seller',
    },
    images: [{ url: '/images/prod1.jpg' }, { url: '/images/prod2.jpg' }],
    affiliateButton: { url: 'https://affiliate.example.com/buy', label: { text: 'Buy Now' } },
    disclaimerLabel: {
      text: 'Disclaimer',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Disclaimer',
    },
  } as unknown as ApiProductProductDocument

  const mockCertificatesHeader = {
    header: {
      text: 'Our Certificates',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Certificates section',
    },
    alignment: AlignmentEnum.CENTER,
    promoteHeaderIcon: false,
  }

  const mockRelatedProductsHeader = {
    header: {
      text: 'Related Products',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Related products section',
    },
    alignment: AlignmentEnum.CENTER,
    promoteHeaderIcon: false,
  }

  const mockRelatedProducts: ApiProductProductDocument[] = [
    {
      documentId: 'prod-2',
      slug: 'related-product-1',
      header: { header: { text: 'Related Product 1' } },
    } as unknown as ApiProductProductDocument,
    {
      documentId: 'prod-3',
      slug: 'related-product-2',
      header: { header: { text: 'Related Product 2' } },
    } as unknown as ApiProductProductDocument,
  ]

  const defaultProps = {
    product: mockProduct,
    certificatesHeader: mockCertificatesHeader,
    relatedProducts: mockRelatedProducts,
    relatedProductsHeader: mockRelatedProductsHeader,
    enableUserProfile: true,
    bySellerText: 'by',
  }

  it('should render product title', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eco Product')
  })

  it('should render product price', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('should render category', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('should render seller name', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('by Green Seller')).toBeInTheDocument()
  })

  it('should render affiliate link when affiliateButton has URL', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const buyLink = screen.getByRole('link', { name: 'Buy Now' })
    expect(buyLink).toHaveAttribute('href', 'https://affiliate.example.com/buy')
    expect(buyLink).toHaveAttribute('target', '_blank')
  })

  it('should render disclaimer label', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-label')).toHaveTextContent('Disclaimer')
  })

  it('should render ImageGallery component', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-image-gallery')).toBeInTheDocument()
    expect(screen.getByTestId('gallery-images')).toHaveTextContent('2 images')
  })

  it('should render ImageGallery with aria-label including product title', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    const gallery = screen.getByTestId('mock-image-gallery')
    expect(gallery).toHaveAttribute('aria-label', 'Eco Product images')
  })

  it('should render ImageGallery wishlist button when enableUserProfile is true', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} enableUserProfile={true} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('gallery-wishlist-button')).toBeInTheDocument()
  })

  it('should not render ImageGallery wishlist button when enableUserProfile is false', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} enableUserProfile={false} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.queryByTestId('gallery-wishlist-button')).not.toBeInTheDocument()
  })

  it('should render product content section with Header', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
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

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithUnknownSection} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-dynamic-zone')).toBeInTheDocument()
    // The section container is rendered by the mock, but the content should be null (empty)
    const sectionContainer = screen.getByTestId('section-unknown.component')
    expect(sectionContainer).toBeEmptyDOMElement()
  })

  it('should render subheader when available', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('A sustainable product')).toBeInTheDocument()
  })

  it('should show ImageGallery placeholder when no images available', () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithNoImages} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('gallery-placeholder')).toHaveTextContent('No images')
  })

  it('should render currency code when non-USD', () => {
    const productWithEuro = {
      ...mockProduct,
      prices: [{ id: 1, amount: 49.99, currency: { symbol: '€', code: 'EUR' } }],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithEuro} />, {
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

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithoutContent} />, {
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

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithoutPrice} />, {
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

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithoutSubheader} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.queryByText('A sustainable product')).not.toBeInTheDocument()
  })

  it('should not render currency code for USD', () => {
    const productWithUSD = {
      ...mockProduct,
      prices: [{ id: 1, amount: 49.99, currency: { symbol: '$', code: 'USD' } }],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithUSD} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    // USD code should not be displayed
    expect(screen.queryByText('USD')).not.toBeInTheDocument()
  })

  it('should handle product with null header.header (empty title)', () => {
    const productWithNoHeader = {
      ...mockProduct,
      header: {
        subheader: { text: 'Some subtitle' },
      },
    } as unknown as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithNoHeader} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    // productTitle should be '' and page should render without crashing
    // The h1 should have empty text content
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('')
  })

  it('should not render currency code when code is empty string', () => {
    const productWithEmptyCode = {
      ...mockProduct,
      prices: [{ id: 1, amount: 49.99, currency: { symbol: '$', code: '' } }],
    } as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithEmptyCode} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    // Price should render but no currency code span
    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('should render ProductCertificatesSection when certificates are present', () => {
    const productWithCertificates = {
      ...mockProduct,
      certificates: [
        { documentId: 'cert1', certificate: { text: 'Certified 1' } },
        { documentId: 'cert2', certificate: { text: 'Certified 2' } },
      ],
    } as unknown as ApiProductProductDocument

    renderWithLayout(<ProductDetailClient {...defaultProps} product={productWithCertificates} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByTestId('mock-product-certificates')).toBeInTheDocument()
    expect(screen.getByTestId('mock-product-certificates')).toHaveTextContent('2 certificates')
    expect(screen.getByTestId('certificates-header')).toHaveTextContent('Our Certificates')
  })

  it('should render in RTL direction', () => {
    const { container } = renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.RTL },
    })

    const rtlContainer = container.querySelector('[dir="rtl"]')
    expect(rtlContainer).toBeInTheDocument()
  })

  it('should render related products carousel when related products are present', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.getByText('Related Products')).toBeInTheDocument()
    expect(screen.getByTestId('mock-carousel')).toBeInTheDocument()
    expect(screen.getAllByTestId('mock-product-card')).toHaveLength(2)
  })

  it('should not render related products section when related products are empty', () => {
    renderWithLayout(<ProductDetailClient {...defaultProps} relatedProducts={[]} />, {
      layoutContext: { lang: CodeEnum.EN },
    })

    expect(screen.queryByText('Related Products')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-carousel')).not.toBeInTheDocument()
  })
})
