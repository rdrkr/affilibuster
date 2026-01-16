// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for FeaturedProductsSection component
 */

import { render, screen } from '@testing-library/react'

import {
  FeaturedProductsSection,
  type FeaturedProductsSectionProps,
} from '@/components/sections/FeaturedProductsSection'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  SymbolPositionEnum,
  type ApiProductProductDocument,
} from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: {
    src: string
    alt: string
    className?: string
    fill?: boolean
    onError?: (e: { target: HTMLImageElement }) => void
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} className={props.className} data-fill={props.fill} />
  },
}))

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size, className }: { icon?: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <>{text}</>
  },
  CMSImage: function MockCMSImage({
    image,
    fallbackAlt,
  }: {
    image?: { url?: string; alternativeText?: string } | string
    fallbackAlt?: string
  }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image.alternativeText ? image.alternativeText : (fallbackAlt ?? '')
    // eslint-disable-next-line @next/next/no-img-element
    return <img data-testid="mock-image" src={getImageUrl()} alt={alt} />
  },
  Header: function MockHeader({
    data,
    level = 2,
  }: {
    data: { header?: { text?: string; ariaDescription?: string }; subheader?: { text?: string } }
    level?: number
  }) {
    const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div data-testid="mock-header">
        <Tag>{data.header?.text}</Tag>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  ButtonLink: function MockButtonLink({
    data,
    className,
  }: {
    data: { label?: { text?: string; ariaDescription?: string }; url: string; openInNewTab: boolean | null }
    className?: string
  }) {
    return (
      <a
        href={data.url}
        className={className}
        target={data.openInNewTab ? '_blank' : undefined}
        rel={data.openInNewTab ? 'noopener noreferrer' : undefined}
        aria-label={data.label?.ariaDescription}
      >
        {data.label?.text}
      </a>
    )
  },
  Card: function MockCard({
    href,
    image,
    imageAlt,
    tag,
    imageOverlay,
    children,
    variant,
    asLink,
  }: {
    href: string
    image?: { url?: string; alternativeText?: string } | null
    imageAlt?: string
    tag?: string
    imageOverlay?: React.ReactNode
    children: React.ReactNode
    variant?: 'product' | 'blog'
    className?: string
    asLink?: boolean
  }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = image?.alternativeText ?? imageAlt ?? ''
    const Wrapper = asLink === false ? 'div' : 'a'
    return (
      <Wrapper
        data-testid="mock-card"
        data-variant={variant}
        href={asLink === false ? undefined : href}
        data-href={asLink === false ? href : undefined}
        className="group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-testid="mock-card-image" src={getImageUrl()} alt={alt} />
        {imageOverlay}
        {tag && <span data-testid="mock-card-tag">{tag}</span>}
        <div data-testid="mock-card-content">{children}</div>
      </Wrapper>
    )
  },
  Carousel: function MockCarousel({
    children,
    direction,
    ariaLabel,
  }: {
    children: React.ReactNode
    direction?: string
    ariaLabel?: string
  }) {
    const isRTL = direction === 'rtl'
    return (
      <div
        data-testid="mock-carousel"
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    )
  },
}))

describe('FeaturedProductsSection', () => {
  const mockSectionData: FeaturedProductsSectionProps['data'] = {
    __component: 'sections.featured-products',
    id: 1,
    header: {
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
      promoteHeaderIcon: false,
      header: {
        text: 'Featured Products',
        ariaDescription: 'Featured products section',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'star',
      },
      subheader: {
        text: 'Our most loved eco-friendly essentials',
        ariaDescription: 'Featured products description',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
    },
    viewAllButton: {
      label: {
        text: 'View All',
        icon: 'arrow_forward',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'View all products',
      },
      url: '/products',
      openInNewTab: false,
    },
  }

  const mockProducts: ApiProductProductDocument[] = [
    {
      documentId: 'prod-1',
      id: 1,
      slug: 'eco-water-bottle',
      price: 29.99,
      publishedAt: '2025-01-01',
      content: {
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: 'Eco Water Bottle',
            ariaDescription: 'Eco-friendly water bottle product',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'water_drop',
          },
        },
      },
      images: [
        {
          documentId: 'img-1',
          id: 1,
          name: 'bottle.webp',
          alternativeText: 'Green water bottle',
          url: '/uploads/bottle.webp',
          hash: 'bottle_abc',
          mime: 'image/webp',
          size: 50,
          provider: 'local',
          publishedAt: '2025-01-01',
        },
      ],
      affiliateButton: {
        label: {
          text: 'View Details',
          icon: 'open_in_new',
          iconPosition: IconPositionEnum.AFTER_TEXT,
          ariaDescription: 'View product details',
        },
        url: '/products/eco-water-bottle',
        openInNewTab: false,
      },
      seoMetadata: {
        metaTitle: 'Eco Water Bottle',
        metaDescription: 'Eco water bottle description',
      },
      viewDetailsLabel: {
        text: 'View Details',
        icon: 'visibility',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'View product details',
      },
    },
    {
      documentId: 'prod-2',
      id: 2,
      slug: 'bamboo-toothbrush',
      price: 9.99,
      publishedAt: '2025-01-01',
      content: {
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: 'Bamboo Toothbrush',
            ariaDescription: 'Bamboo toothbrush product',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'eco',
          },
        },
      },
      images: [
        {
          documentId: 'img-2',
          id: 2,
          name: 'toothbrush.webp',
          alternativeText: 'Bamboo toothbrush',
          url: '/uploads/toothbrush.webp',
          hash: 'toothbrush_abc',
          mime: 'image/webp',
          size: 30,
          provider: 'local',
          publishedAt: '2025-01-01',
        },
      ],
      affiliateButton: {
        label: {
          text: 'View Details',
          icon: 'open_in_new',
          iconPosition: IconPositionEnum.AFTER_TEXT,
          ariaDescription: 'View toothbrush details',
        },
        url: '/products/bamboo-toothbrush',
        openInNewTab: false,
      },
      seoMetadata: {
        metaTitle: 'Bamboo Toothbrush',
        metaDescription: 'Bamboo toothbrush description',
      },
      viewDetailsLabel: {
        text: 'View Details',
        icon: 'visibility',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'View product details',
      },
    },
  ]

  it('should render section with header text', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Featured Products' })).toBeInTheDocument()
  })

  it('should render subheader when provided', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    expect(screen.getByText('Our most loved eco-friendly essentials')).toBeInTheDocument()
  })

  it('should render view all button with correct link', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    const viewAllLink = screen.getByRole('link', { name: /View all products/i })
    expect(viewAllLink).toHaveAttribute('href', '/products')
    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('should render all products', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    expect(screen.getByText('Eco Water Bottle')).toBeInTheDocument()
    expect(screen.getByText('Bamboo Toothbrush')).toBeInTheDocument()
  })

  it('should render product prices', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
  })

  it('should render product images', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('alt', 'Green water bottle')
    expect(images[1]).toHaveAttribute('alt', 'Bamboo toothbrush')
  })

  it('should render product detail links', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    const detailLinks = screen.getAllByRole('link', { name: /View.*details/i })
    expect(detailLinks).toHaveLength(2)
    expect(detailLinks[0]).toHaveAttribute('href', '/products/eco-water-bottle')
    expect(detailLinks[1]).toHaveAttribute('href', '/products/bamboo-toothbrush')
  })

  it('should not render when products array is empty', () => {
    const { container } = render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={[]} />
    )

    expect(container.querySelector('section')).not.toBeInTheDocument()
  })

  it('should render currency symbol when provided', () => {
    const productsWithCurrency: ApiProductProductDocument[] = [
      {
        ...mockProducts[0]!,
        currency: {
          documentId: 'curr-1',
          id: 1,
          code: 'EUR',
          symbol: '€',
          name: 'Euro',
          decimalPlaces: 2,
          symbolPosition: SymbolPositionEnum.BEFORE,
          thousandsSeparator: ',',
          decimalSeparator: '.',
          exchangeRate: 1.0,
          publishedAt: '2025-01-01',
          seoMetadata: {
            metaTitle: 'Euro',
            metaDescription: 'Euro currency',
          },
        },
      },
    ]

    render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={productsWithCurrency} />
    )

    expect(screen.getByText('€29.99')).toBeInTheDocument()
  })

  it('should use placeholder image when product image URL is missing', () => {
    const productsWithoutImage: ApiProductProductDocument[] = [
      {
        ...mockProducts[0]!,
        images: [
          {
            ...mockProducts[0]!.images![0]!,
            url: '',
          },
        ],
      },
    ]

    render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={productsWithoutImage} />
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should handle absolute image URLs', () => {
    const productsWithAbsoluteUrl: ApiProductProductDocument[] = [
      {
        ...mockProducts[0]!,
        images: [
          {
            ...mockProducts[0]!.images![0]!,
            url: 'https://cdn.example.com/bottle.webp',
          },
        ],
      },
    ]

    render(
      <FeaturedProductsSection
        direction={DirectionEnum.LTR}
        data={mockSectionData}
        products={productsWithAbsoluteUrl}
      />
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/bottle.webp')
  })

  it('should open view all link in new tab when configured', () => {
    const dataWithNewTab: FeaturedProductsSectionProps['data'] = {
      ...mockSectionData,
      viewAllButton: {
        ...mockSectionData.viewAllButton,
        openInNewTab: true,
      },
    }

    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={dataWithNewTab} products={mockProducts} />)

    const link = screen.getByRole('link', { name: /View all products/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should use product name as alt text when alternativeText is missing', () => {
    const { alternativeText: _alternativeText, ...imageWithoutAlt } = mockProducts[0]!.images![0]!
    const productsWithoutAlt: ApiProductProductDocument[] = [
      {
        ...mockProducts[0]!,
        images: [imageWithoutAlt],
      },
    ]

    render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={productsWithoutAlt} />
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'Eco Water Bottle')
  })

  it('should have correct aria-label on section', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    const section = screen.getByRole('region', { name: 'Featured products section' })
    expect(section).toBeInTheDocument()
  })

  it('should align view all button to start for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    render(<FeaturedProductsSection data={mockSectionData} products={mockProducts} direction={DirectionEnum.RTL} />)

    const viewAllLink = screen.getByRole('link', { name: /View all products/i })
    expect(viewAllLink).toHaveClass('self-start')
  })

  it('should align view all button to end for LTR direction (default)', () => {
    render(<FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />)

    const viewAllLink = screen.getByRole('link', { name: /View all products/i })
    expect(viewAllLink).toHaveClass('self-end')
  })

  it('should apply dir="rtl" to carousel for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    const { container } = render(
      <FeaturedProductsSection data={mockSectionData} products={mockProducts} direction={DirectionEnum.RTL} />
    )

    const carousel = container.querySelector('.snap-x')
    expect(carousel).toHaveAttribute('dir', 'rtl')
  })

  it('should apply dir="ltr" to carousel for LTR direction', () => {
    const { container } = render(
      <FeaturedProductsSection direction={DirectionEnum.LTR} data={mockSectionData} products={mockProducts} />
    )

    const carousel = container.querySelector('.snap-x')
    expect(carousel).toHaveAttribute('dir', 'ltr')
  })

  it('should render favorite button correctly', () => {
    render(
      <FeaturedProductsSection
        direction={DirectionEnum.LTR}
        data={mockSectionData}
        products={mockProducts}
        enableUserProfile={true}
      />
    )
    const favoriteButtons = screen.getAllByRole('button', { name: /Eco-friendly water bottle product/i })
    expect(favoriteButtons).toHaveLength(1)

    // Check inner icon
    const icon = favoriteButtons[0]?.querySelector('[data-testid="mock-icon"][data-icon="favorite_border"]')
    expect(icon).toBeInTheDocument()
  })

  it('should use empty string for favorite button aria-label if missing', () => {
    // Create a product with missing aria description
    const productWithNoAria: ApiProductProductDocument = {
      ...mockProducts[0]!,
      content: {
        ...mockProducts[0]!.content!,
        header: {
          ...mockProducts[0]!.content!.header!,
          header: {
            text: 'Product',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
            ariaDescription: undefined as unknown as string, // Simulating undefined from API
          },
        },
      },
    }
    render(
      <FeaturedProductsSection
        direction={DirectionEnum.LTR}
        data={mockSectionData}
        products={[productWithNoAria]}
        enableUserProfile={true}
      />
    )
    // Find button by icon since aria-label is empty
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveAttribute('data-icon', 'favorite_border')
    const button = icon.closest('button')
    expect(button).toHaveAttribute('aria-label', '')
  })
})
