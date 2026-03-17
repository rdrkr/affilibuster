// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ServerHeroSection component
 */

import { render, screen } from '@testing-library/react'

import { ServerHeroSection, type ServerHeroSectionProps } from '@/components/sections/ServerHeroSection'
import { AlignmentEnum, DirectionEnum, IconPositionEnum, VariantEnum } from '@/lib/generated/types.gen'

// Mock next/image — captures priority, fetchPriority, and loading props
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: {
    src: string
    alt: string
    className?: string
    fill?: boolean
    priority?: boolean
    fetchPriority?: string
    loading?: string
    sizes?: string
  }) {
    return (
      <img
        src={props.src}
        alt={props.alt}
        className={props.className}
        data-fill={props.fill}
        data-priority={props.priority ? 'true' : undefined}
        data-fetch-priority={props.fetchPriority}
        data-loading={props.loading}
        data-sizes={props.sizes}
      />
    )
  },
}))

// Mock the CMS element components — same pattern as HeroSection test
jest.mock('@/components/elements', () => ({
  resolveImageUrl: function mockResolveImageUrl(
    source: { url?: string; alternativeText?: string } | undefined | null
  ): string {
    if (!source?.url) return '/images/placeholder.svg'
    if (source.url.startsWith('http')) return source.url
    return `https://localhost:1337${source.url}`
  },
  getAltText: function mockGetAltText(media: { alternativeText?: string } | undefined | null): string {
    return media?.alternativeText ?? ''
  },
  Header: function MockHeader({
    data,
  }: {
    data: { header?: { text?: string; ariaDescription?: string }; subheader?: { text?: string } }
  }) {
    return (
      <div data-testid="mock-header">
        <h1>{data.header?.text}</h1>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  ButtonLink: function MockButtonLink({
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

describe('ServerHeroSection', () => {
  const mockBaseData: ServerHeroSectionProps['data'] = {
    __component: 'sections.hero',
    id: 1,
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
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
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should render subheader when provided', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(screen.getByText('Discover curated products for you and the planet.')).toBeInTheDocument()
  })

  it('should render explore button with correct text and link', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const link = screen.getByRole('link', { name: /Navigate to products page/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/products')
    expect(screen.getByText('Explore Top Picks')).toBeInTheDocument()
  })

  it('should render hero image with alt text', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'A person holding a plant')
    expect(image).toHaveAttribute('src', 'https://localhost:1337/uploads/hero-plant.webp')
  })

  it('should render image with priority prop for LCP preload', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('data-priority', 'true')
  })

  it('should render image with sizes="100vw"', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('data-sizes', '100vw')
  })

  it('should render image with fill attribute', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('data-fill', 'true')
  })

  it('should render gradient overlay for TEXT_OVER_BACKGROUND variant', () => {
    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const overlay = container.querySelector('.bg-linear-to-t')
    expect(overlay).toBeInTheDocument()
  })

  it('should not render gradient overlay for TEXT_ABOVE_BACKGROUND variant', () => {
    const data: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
    }

    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

    const overlay = container.querySelector('.bg-linear-to-t')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should not render gradient overlay for TEXT_BELOW_BACKGROUND variant', () => {
    const data: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      variant: VariantEnum.TEXT_BELOW_BACKGROUND,
    }

    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

    const overlay = container.querySelector('.bg-linear-to-t')
    expect(overlay).not.toBeInTheDocument()
  })

  it('should render placeholder image when image URL is missing', () => {
    const dataWithoutImage: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      image: {
        ...mockBaseData.image,
        url: '',
      },
    }

    render(<ServerHeroSection direction={DirectionEnum.LTR} data={dataWithoutImage} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should render empty alt text when alternativeText is missing', () => {
    const dataWithoutAlt: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      image: {
        ...mockBaseData.image,
        alternativeText: undefined as unknown as string,
      },
    }

    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={dataWithoutAlt} />)

    // An img with alt="" gets role "presentation" per accessibility spec, so query by tag
    const image = container.querySelector('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', '')
  })

  it('should not render explore button when not provided', () => {
    const { exploreButton: _exploreButton, ...dataWithoutButton } = mockBaseData

    render(<ServerHeroSection direction={DirectionEnum.LTR} data={dataWithoutButton} />)

    expect(screen.queryByRole('link', { name: /Navigate to products page/i })).not.toBeInTheDocument()
  })

  it('should open link in new tab when openInNewTab is true', () => {
    const dataWithNewTab: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      exploreButton: {
        ...mockBaseData.exploreButton!,
        openInNewTab: true,
      },
    }

    render(<ServerHeroSection direction={DirectionEnum.LTR} data={dataWithNewTab} />)

    const link = screen.getByRole('link', { name: /Navigate to products page/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should handle absolute image URLs', () => {
    const dataWithAbsoluteUrl: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      image: {
        ...mockBaseData.image,
        url: 'https://cdn.example.com/hero-plant.webp',
      },
    }

    render(<ServerHeroSection direction={DirectionEnum.LTR} data={dataWithAbsoluteUrl} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/hero-plant.webp')
  })

  it('should have correct aria-label on section', () => {
    render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const section = screen.getByRole('region', { name: 'Main hero heading' })
    expect(section).toBeInTheDocument()
  })

  it('should not have animate-fade-in-up class', () => {
    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    const animated = container.querySelector('.animate-fade-in-up')
    expect(animated).not.toBeInTheDocument()
  })

  it('should apply justify-center when header alignment is CENTER in TEXT_OVER_BACKGROUND', () => {
    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

    expect(container.firstChild).toHaveClass('justify-center')
    expect(container.firstChild).not.toHaveClass('justify-start')
  })

  it('should apply justify-start when header alignment is LANGUAGE_DIRECTION in TEXT_OVER_BACKGROUND', () => {
    const dataWithAlign: ServerHeroSectionProps['data'] = {
      ...mockBaseData,
      variant: VariantEnum.TEXT_OVER_BACKGROUND,
      header: {
        ...mockBaseData.header,
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        promoteHeaderIcon: false,
      },
    }
    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={dataWithAlign} />)

    expect(container.firstChild).toHaveClass('justify-start')
    expect(container.firstChild).not.toHaveClass('justify-center')
  })

  it('should not apply text-center to section container', () => {
    const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)
    expect(container.firstChild).not.toHaveClass('text-center')
  })

  describe('Layout Variants & Alignment', () => {
    it('should render TEXT_BELOW_BACKGROUND with LTR alignment', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const contentDiv = container.querySelector('.text-left.items-start')
      expect(contentDiv).toBeInTheDocument()

      const contentWrapper = container.querySelector('.w-full.flex')
      expect(contentWrapper).toHaveClass('justify-start')
    })

    it('should render TEXT_BELOW_BACKGROUND with RTL alignment', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.RTL} data={data} />)

      const contentDiv = container.querySelector('.text-right.items-end')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv?.parentElement).toHaveClass('justify-end')
    })

    it('should render TEXT_BELOW_BACKGROUND with CENTER alignment', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.CENTER },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const contentDiv = container.querySelector('.text-center.items-center')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv?.parentElement).toHaveClass('justify-center')
    })

    it('should render TEXT_ABOVE_BACKGROUND with LTR alignment', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const contentDiv = container.querySelector('.text-left.items-start')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv?.parentElement).toHaveClass('justify-start')
    })

    it('should render TEXT_ABOVE_BACKGROUND with RTL alignment', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.RTL} data={data} />)

      const contentDiv = container.querySelector('.text-right.items-end')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv?.parentElement).toHaveClass('justify-end')
    })

    it('should render TEXT_OVER_BACKGROUND with RTL alignment (checking overlay margin)', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_OVER_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.RTL} data={data} />)

      const contentDiv = container.querySelector('.mr-8')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv).toHaveClass('text-right')
    })

    it('should render TEXT_OVER_BACKGROUND with LTR alignment (checking overlay margin)', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_OVER_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const contentDiv = container.querySelector('.ml-8')
      expect(contentDiv).toBeInTheDocument()
      expect(contentDiv).toHaveClass('text-left')
    })

    it('should render TEXT_ABOVE_BACKGROUND with CENTER alignment (items-center class)', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.CENTER },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.firstChild as HTMLElement
      expect(section).toHaveClass('items-center')
    })

    it('should render TEXT_BELOW_BACKGROUND with CENTER alignment (items-center on section)', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.CENTER },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.firstChild as HTMLElement
      expect(section).toHaveClass('items-center')
    })

    it('should render TEXT_BELOW_BACKGROUND with LTR items-start on section', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.firstChild as HTMLElement
      expect(section).toHaveClass('items-start')
    })

    it('should render TEXT_BELOW_BACKGROUND with RTL items-end on section', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: { ...mockBaseData.header, alignment: AlignmentEnum.LANGUAGE_DIRECTION },
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.RTL} data={data} />)

      const section = container.firstChild as HTMLElement
      expect(section).toHaveClass('items-end')
    })

    it('should fallback to empty aria-label in TEXT_OVER_BACKGROUND when ariaDescription is undefined', () => {
      const data = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_OVER_BACKGROUND,
        header: {
          ...mockBaseData.header,
          header: { ...mockBaseData.header.header, ariaDescription: undefined },
        },
      } as unknown as ServerHeroSectionProps['data']
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('aria-label', '')
    })

    it('should fallback to empty aria-label in TEXT_ABOVE_BACKGROUND when ariaDescription is undefined', () => {
      const data = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
        header: {
          ...mockBaseData.header,
          header: { ...mockBaseData.header.header, ariaDescription: undefined },
        },
      } as unknown as ServerHeroSectionProps['data']
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('aria-label', '')
    })

    it('should fallback to empty aria-label in TEXT_BELOW_BACKGROUND when ariaDescription is undefined', () => {
      const data = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
        header: {
          ...mockBaseData.header,
          header: { ...mockBaseData.header.header, ariaDescription: undefined },
        },
      } as unknown as ServerHeroSectionProps['data']
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.querySelector('section')
      expect(section).toHaveAttribute('aria-label', '')
    })

    it('should apply opacity-80 class to image in TEXT_OVER_BACKGROUND variant', () => {
      render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

      const image = screen.getByRole('img')
      expect(image).toHaveClass('opacity-80')
      expect(image).not.toHaveClass('rounded-xl')
    })

    it('should apply rounded-xl class to image in TEXT_ABOVE_BACKGROUND variant', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
      }

      render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const image = screen.getByRole('img')
      expect(image).toHaveClass('rounded-xl')
      expect(image).not.toHaveClass('opacity-80')
    })

    it('should apply rounded-xl class to image in TEXT_BELOW_BACKGROUND variant', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
      }

      render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const image = screen.getByRole('img')
      expect(image).toHaveClass('rounded-xl')
      expect(image).not.toHaveClass('opacity-80')
    })

    it('should render image container as absolute for TEXT_OVER_BACKGROUND', () => {
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

      const imageContainer = container.querySelector('.absolute.inset-0.z-0')
      expect(imageContainer).toBeInTheDocument()
    })

    it('should render image container as relative for TEXT_ABOVE_BACKGROUND', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const imageContainer = container.querySelector('.relative.w-full')
      expect(imageContainer).toBeInTheDocument()
    })

    it('should render content before image in TEXT_ABOVE_BACKGROUND', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_ABOVE_BACKGROUND,
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.firstChild as HTMLElement
      const children = Array.from(section.children)
      // Content wrapper is first, image wrapper is second
      expect(children[0]).toContainElement(screen.getByTestId('mock-header'))
      expect(children[1]).toContainElement(screen.getByRole('img'))
    })

    it('should render image before content in TEXT_BELOW_BACKGROUND', () => {
      const data: ServerHeroSectionProps['data'] = {
        ...mockBaseData,
        variant: VariantEnum.TEXT_BELOW_BACKGROUND,
      }
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={data} />)

      const section = container.firstChild as HTMLElement
      const children = Array.from(section.children)
      // Image wrapper is first, content wrapper is second
      expect(children[0]).toContainElement(screen.getByRole('img'))
      expect(children[1]).toContainElement(screen.getByTestId('mock-header'))
    })

    it('should not apply margin class to content when CENTER alignment in TEXT_OVER_BACKGROUND', () => {
      const { container } = render(<ServerHeroSection direction={DirectionEnum.LTR} data={mockBaseData} />)

      expect(container.querySelector('.ml-8')).not.toBeInTheDocument()
      expect(container.querySelector('.mr-8')).not.toBeInTheDocument()
    })
  })
})
