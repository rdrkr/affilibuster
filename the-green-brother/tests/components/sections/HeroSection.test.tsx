// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for HeroSection component
 */

import { render, screen } from '@testing-library/react'

import { HeroSection, type HeroSectionProps } from '@/components/sections/HeroSection'
import { AlignmentEnum, DirectionEnum, IconPositionEnum, VariantEnum } from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: { src: string; alt: string; className?: string; fill?: boolean }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} className={props.className} data-fill={props.fill} />
  },
}))

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  CMSIcon: function MockCMSIcon({ icon, size, className }: { icon: string; size?: string; className?: string }) {
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
  }: {
    data: { header?: { text?: string; ariaDescription?: string }; subheader?: { text?: string } }
  }) {
    return (
      <div data-testid="mock-header">
        <h2>{data.header?.text}</h2>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  Button: function MockButton({
    data,
  }: {
    data: { label?: { text?: string; ariaDescription?: string }; url: string; openInNewTab: boolean | null }
  }) {
    return (
      <a
        href={data.url}
        target={data.openInNewTab ? '_blank' : undefined}
        rel={data.openInNewTab ? 'noopener noreferrer' : undefined}
        aria-label={data.label?.ariaDescription}
      >
        {data.label?.text}
      </a>
    )
  },
}))

describe('HeroSection', () => {
  const mockBaseData: HeroSectionProps['data'] = {
    __component: 'sections.hero',
    id: 1,
    header: {
      alignment: AlignmentEnum.CENTER,
      header: {
        text: 'Live Sustainably, <span class="text-primary">Effortlessly</span>',
        ariaDescription: 'Main hero heading',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'eco',
      },
      subheader: {
        text: 'Discover curated products for you and the planet.',
        ariaDescription: 'Hero subheading',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
    },
    exploreButton: {
      label: {
        text: 'Explore Top Picks',
        icon: 'arrow_forward',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'Navigate to products page',
      },
      url: '/products',
      openInNewTab: false,
    },
    image: {
      documentId: 'img-1',
      id: 1,
      name: 'hero-plant.webp',
      alternativeText: 'A person holding a plant',
      url: '/uploads/hero-plant.webp',
      hash: 'hero_abc123',
      mime: 'image/webp',
      size: 100,
      provider: 'local',
      publishedAt: '2025-01-01',
    },
    variant: VariantEnum.TEXT_OVER_BACKGROUND,
  }

  it('should render hero section with header text', () => {
    render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    // Check that header text is rendered (as HTML)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render subheader when provided', () => {
    render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(screen.getByText('Discover curated products for you and the planet.')).toBeInTheDocument()
  })

  it('should render explore button with correct text and link', () => {
    render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const link = screen.getByRole('link', { name: /Navigate to products page/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/products')
    expect(screen.getByText('Explore Top Picks')).toBeInTheDocument()
  })

  it('should render hero image with alt text', () => {
    render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'A person holding a plant')
    expect(image).toHaveAttribute('src', 'https://localhost:1337/uploads/hero-plant.webp')
  })

  it('should render gradient overlay for text-over-background variant', () => {
    const { container } = render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    // Check for gradient overlay div
    const overlay = container.querySelector('.bg-linear-to-t')
    expect(overlay).toBeInTheDocument()
  })

  it('should not render gradient overlay for other variants', () => {
    const dataWithDifferentVariant: HeroSectionProps['data'] = {
      ...mockBaseData,
      variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
    }

    const { container } = render(<HeroSection direction={DirectionEnum.LTR} data={dataWithDifferentVariant} />)

    const overlay = container.querySelector('.bg-linear-to-t')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should render placeholder image when image URL is missing', () => {
    const dataWithoutImage: HeroSectionProps['data'] = {
      ...mockBaseData,
      image: {
        ...mockBaseData.image,
        url: '',
      },
    }

    render(<HeroSection direction={DirectionEnum.LTR} data={dataWithoutImage} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should not render explore button when not provided', () => {
    const { exploreButton: _exploreButton, ...dataWithoutButton } = mockBaseData

    render(<HeroSection direction={DirectionEnum.LTR} data={dataWithoutButton} />)

    expect(screen.queryByRole('link', { name: /Navigate to products page/i })).not.toBeInTheDocument()
  })

  it('should not render subheader when not provided', () => {
    const { subheader: _subheader, ...headerWithoutSubheader } = mockBaseData.header
    const dataWithoutSubheader: HeroSectionProps['data'] = {
      ...mockBaseData,
      header: headerWithoutSubheader,
    }

    render(<HeroSection direction={DirectionEnum.LTR} data={dataWithoutSubheader} />)

    expect(screen.queryByText('Discover curated products for you and the planet.')).not.toBeInTheDocument()
  })

  it('should open link in new tab when openInNewTab is true', () => {
    const dataWithNewTab: HeroSectionProps['data'] = {
      ...mockBaseData,
      exploreButton: {
        ...mockBaseData.exploreButton!,
        openInNewTab: true,
      },
    }

    render(<HeroSection direction={DirectionEnum.LTR} data={dataWithNewTab} />)

    const link = screen.getByRole('link', { name: /Navigate to products page/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should handle absolute image URLs', () => {
    const dataWithAbsoluteUrl: HeroSectionProps['data'] = {
      ...mockBaseData,
      image: {
        ...mockBaseData.image,
        url: 'https://cdn.example.com/hero-plant.webp',
      },
    }

    render(<HeroSection direction={DirectionEnum.LTR} data={dataWithAbsoluteUrl} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/hero-plant.webp')
  })

  it('should use default CMSUrl when not provided', () => {
    // Mock process.env
    const originalEnv = process.env.NEXT_PUBLIC_CMS_URL
    delete process.env.NEXT_PUBLIC_CMS_URL

    render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', expect.stringContaining('/uploads/hero-plant.webp'))

    // Restore
    if (originalEnv) {
      process.env.NEXT_PUBLIC_CMS_URL = originalEnv
    }
  })

  it('should have correct aria-label on section', () => {
    render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const section = screen.getByRole('region', { name: 'Main hero heading' })
    expect(section).toBeInTheDocument()
  })

  it('should not apply text-center to section container', () => {
    const { container } = render(<HeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)
    expect(container.firstChild).not.toHaveClass('text-center')
  })

  it('should apply justify-start when header alignment is LANGUAGE_DIRECTION in TEXT_OVER_BACKGROUND', () => {
    const dataWithAlign = {
      ...mockBaseData,
      variant: VariantEnum.TEXT_OVER_BACKGROUND,
      header: {
        ...mockBaseData.header,
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
      },
    }
    const { container } = render(<HeroSection direction={DirectionEnum.LTR} data={dataWithAlign} />)
    // Container should have justify-start
    expect(container.firstChild).toHaveClass('justify-start')
    expect(container.firstChild).not.toHaveClass('justify-center')
  })

  it('should apply justify-center when header alignment is CENTER in TEXT_OVER_BACKGROUND', () => {
    const dataWithAlign = {
      ...mockBaseData,
      variant: VariantEnum.TEXT_OVER_BACKGROUND,
      header: {
        ...mockBaseData.header,
        alignment: AlignmentEnum.CENTER,
      },
    }
    const { container } = render(<HeroSection direction={DirectionEnum.LTR} data={dataWithAlign} />)
    // Container should have justify-center
    expect(container.firstChild).toHaveClass('justify-center')
    expect(container.firstChild).not.toHaveClass('justify-start')
  })
})
