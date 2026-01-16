// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BlogTeaserSection component
 */

import { render, screen } from '@testing-library/react'

import { BlogTeaserSection, type BlogTeaserSectionProps } from '@/components/sections/BlogTeaserSection'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiBlogPostBlogPostDocument,
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
    const HeadingTag = `h${String(level)}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div data-testid="mock-header">
        <HeadingTag>{data.header?.text}</HeadingTag>
        {data.subheader?.text && <p>{data.subheader.text}</p>}
      </div>
    )
  },
  Label: function MockLabel({
    data,
    className,
    iconSize,
  }: {
    data?: { text?: string; icon?: string; iconPosition?: string }
    className?: string
    iconSize?: string
  }) {
    return (
      <span data-testid="mock-label" className={className} data-icon-size={iconSize}>
        {data?.text}
        {data?.icon && <span data-testid="mock-label-icon">{data.icon}</span>}
      </span>
    )
  },
  Card: function MockCard({
    href,
    image,
    imageAlt,
    tag,
    children,
    variant,
    asLink,
  }: {
    href: string
    image?: { url?: string; alternativeText?: string } | null
    imageAlt?: string
    tag?: string
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
        className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    )
  },
  ButtonLink: function MockButtonLink({
    data,
    className,
  }: {
    data: { label: { text: string }; url: string }
    className?: string
  }) {
    return (
      <a href={data.url} className={className}>
        {data.label.text}
      </a>
    )
  },
}))

describe('BlogTeaserSection', () => {
  const mockSectionData: BlogTeaserSectionProps['data'] = {
    __component: 'sections.blog-teaser',
    id: 1,
    header: {
      alignment: AlignmentEnum.CENTER,
      promoteHeaderIcon: false,
      header: {
        text: 'From Our Blog',
        ariaDescription: 'Blog posts section',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'article',
      },
      subheader: {
        text: 'Discover tips and stories to inspire your eco-friendly journey.',
        ariaDescription: 'Blog section description',

        iconPosition: IconPositionEnum.BEFORE_TEXT,
      },
    },
    viewAllButton: {
      label: {
        text: 'View All Posts',
        icon: 'arrow_forward',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'View all blog posts',
      },
      url: '/blog',
      openInNewTab: false,
    },
  }

  const mockBlogPosts: ApiBlogPostBlogPostDocument[] = [
    {
      documentId: 'post-1',
      id: 1,
      slug: 'reduce-plastic-waste',
      readTime: '5 min read',
      publishedDate: '2025-01-15',
      publishedAt: '2025-01-15',
      content: {
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: '10 Ways to Reduce Plastic Waste',
            ariaDescription: 'Read article about reducing plastic',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'eco',
          },
          subheader: {
            text: 'Simple changes to make a big impact on reducing your plastic footprint.',
            ariaDescription: 'Article excerpt',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
          },
        },
      },
      featuredImage: {
        documentId: 'img-1',
        id: 1,
        name: 'plastic-waste.webp',
        alternativeText: 'Plastic waste reduction tips',
        url: '/uploads/plastic-waste.webp',
        hash: 'plastic_abc',
        mime: 'image/webp',
        size: 80,
        provider: 'local',
        publishedAt: '2025-01-15',
      },
      tags: [
        {
          documentId: 'tag-1',
          id: 1,
          tagId: 'sustainability',
          publishedAt: '2025-01-01',
          tag: {
            text: 'Sustainability',
            ariaDescription: 'Sustainability tag',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'eco',
          },
          seoMetadata: {
            metaTitle: 'Sustainability',
            metaDescription: 'Sustainability tag',
          },
        },
      ],
      seoMetadata: {
        metaTitle: '10 Ways to Reduce Plastic Waste',
        metaDescription: 'Tips for reducing plastic waste',
      },
      readArticleLabel: {
        text: 'Read Article',
        icon: 'arrow_forward',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'Read article',
      },
    },
    {
      documentId: 'post-2',
      id: 2,
      slug: 'sustainable-fashion-guide',
      readTime: '7 min read',
      publishedDate: '2025-01-10',
      publishedAt: '2025-01-10',
      content: {
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: 'Sustainable Fashion Guide',
            ariaDescription: 'Read article about sustainable fashion',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'styler',
          },
          subheader: {
            text: 'How to build an eco-friendly wardrobe without breaking the bank.',
            ariaDescription: 'Fashion article excerpt',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
          },
        },
      },
      featuredImage: {
        documentId: 'img-2',
        id: 2,
        name: 'fashion.webp',
        alternativeText: 'Sustainable fashion tips',
        url: '/uploads/fashion.webp',
        hash: 'fashion_abc',
        mime: 'image/webp',
        size: 70,
        provider: 'local',
        publishedAt: '2025-01-10',
      },
      tags: [
        {
          documentId: 'tag-2',
          id: 2,
          tagId: 'fashion',
          publishedAt: '2025-01-01',
          tag: {
            text: 'Fashion',
            ariaDescription: 'Fashion tag',

            iconPosition: IconPositionEnum.BEFORE_TEXT,
            icon: 'styler',
          },
          seoMetadata: {
            metaTitle: 'Fashion',
            metaDescription: 'Fashion tag',
          },
        },
      ],
      seoMetadata: {
        metaTitle: 'Sustainable Fashion Guide',
        metaDescription: 'Guide to sustainable fashion',
      },
      readArticleLabel: {
        text: 'Read Article',
        icon: 'arrow_forward',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'Read article',
      },
    },
  ]

  it('should render section with header text', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    expect(screen.getByRole('heading', { level: 2, name: 'From Our Blog' })).toBeInTheDocument()
  })

  it('should render view all button with correct alignment for LTR', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    const button = screen.getByRole('link', { name: 'View All Posts' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/blog')
    expect(button).toHaveClass('self-end')
  })

  it('should render view all button with correct alignment for RTL', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    render(<BlogTeaserSection direction={DirectionEnum.RTL} data={mockSectionData} blogPosts={mockBlogPosts} />)

    const button = screen.getByRole('link', { name: 'View All Posts' })
    expect(button).toHaveClass('self-start')
  })

  it('should render subheader when provided', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    expect(screen.getByText('Discover tips and stories to inspire your eco-friendly journey.')).toBeInTheDocument()
  })

  it('should not render subheader when not provided', () => {
    const { subheader: _subheader, ...headerWithoutSubheader } = mockSectionData.header
    const dataWithoutSubheader: BlogTeaserSectionProps['data'] = {
      ...mockSectionData,
      header: headerWithoutSubheader,
    }

    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={dataWithoutSubheader} blogPosts={mockBlogPosts} />)

    expect(
      screen.queryByText('Discover tips and stories to inspire your eco-friendly journey.')
    ).not.toBeInTheDocument()
  })

  it('should render all blog post titles', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    expect(screen.getByText('10 Ways to Reduce Plastic Waste')).toBeInTheDocument()
    expect(screen.getByText('Sustainable Fashion Guide')).toBeInTheDocument()
  })

  it('should render blog post excerpts', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    expect(
      screen.getByText('Simple changes to make a big impact on reducing your plastic footprint.')
    ).toBeInTheDocument()
    expect(screen.getByText('How to build an eco-friendly wardrobe without breaking the bank.')).toBeInTheDocument()
  })

  it('should render blog post tags', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    expect(screen.getByText('Sustainability')).toBeInTheDocument()
    expect(screen.getByText('Fashion')).toBeInTheDocument()
  })

  it('should render blog post images', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('alt', 'Plastic waste reduction tips')
    expect(images[1]).toHaveAttribute('alt', 'Sustainable fashion tips')
  })

  it('should render blog post links with correct href', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    const links = screen.getAllByRole('link')
    // Skip first link (view all button)
    expect(links[1]).toHaveAttribute('href', '/blog/reduce-plastic-waste')
    expect(links[2]).toHaveAttribute('href', '/blog/sustainable-fashion-guide')
  })

  it('should not render when blogPosts array is empty', () => {
    const { container } = render(
      <BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={[]} />
    )

    expect(container.querySelector('section')).not.toBeInTheDocument()
  })

  it('should use placeholder image when featured image URL is missing', () => {
    const postsWithoutImage: ApiBlogPostBlogPostDocument[] = [
      {
        ...mockBlogPosts[0]!,
        featuredImage: {
          ...mockBlogPosts[0]!.featuredImage!,
          url: '',
        },
      },
    ]

    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={postsWithoutImage} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should handle absolute image URLs', () => {
    const postsWithAbsoluteUrl: ApiBlogPostBlogPostDocument[] = [
      {
        ...mockBlogPosts[0]!,
        featuredImage: {
          ...mockBlogPosts[0]!.featuredImage!,
          url: 'https://cdn.example.com/plastic-waste.webp',
        },
      },
    ]

    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={postsWithAbsoluteUrl} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/plastic-waste.webp')
  })

  it('should not render tag when no tags provided', () => {
    const { tags: _tags, ...postWithoutTags } = mockBlogPosts[0]!
    const postsWithoutTags: ApiBlogPostBlogPostDocument[] = [postWithoutTags]

    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={postsWithoutTags} />)

    expect(screen.queryByText('Sustainability')).not.toBeInTheDocument()
  })

  it('should use post title as alt text when alternativeText is missing', () => {
    const { alternativeText: _alternativeText, ...imageWithoutAlt } = mockBlogPosts[0]!.featuredImage!
    const postsWithoutAlt: ApiBlogPostBlogPostDocument[] = [
      {
        ...mockBlogPosts[0]!,
        featuredImage: imageWithoutAlt,
      },
    ]

    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={postsWithoutAlt} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', '10 Ways to Reduce Plastic Waste')
  })

  it('should have correct aria-label on section', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    const sections = screen.getAllByRole('region', { name: 'Blog posts section' })
    expect(sections.length).toBeGreaterThan(0)
    expect(sections[0]).toBeInTheDocument()
  })

  it('should handle missing aria-label on section', () => {
    const { header, ...restData } = mockSectionData
    const dataWithoutAria = {
      ...restData,
      header: {
        ...header,
        header: { ...header.header, ariaDescription: undefined },
      },
    } as unknown as BlogTeaserSectionProps['data']

    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={dataWithoutAria} blogPosts={mockBlogPosts} />)

    // Should default to empty string
    // Since role="region" requires label, it falls back to generic section.
    // We check attribute directly.
    // Query by class to find the section
    const section = screen.getByRole('heading', { level: 2 }).closest('section')
    expect(section).toHaveAttribute('aria-label', '')
  })

  it('should render read article call-to-action', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    // Check for the readArticleLabel text (from mock data)
    const readArticleTexts = screen.getAllByText('Read Article')
    expect(readArticleTexts).toHaveLength(2)
  })

  it('should render Label component for read article in RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    render(<BlogTeaserSection data={mockSectionData} blogPosts={mockBlogPosts} direction={DirectionEnum.RTL} />)

    // Label component handles RTL internally
    const labels = screen.getAllByTestId('mock-label')
    expect(labels.length).toBe(2) // One per blog post
  })

  it('should render read article using Label component for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    render(<BlogTeaserSection data={mockSectionData} blogPosts={mockBlogPosts} direction={DirectionEnum.RTL} />)

    const labels = screen.getAllByTestId('mock-label')
    expect(labels.length).toBeGreaterThan(0)
  })

  it('should render read article using Label component for LTR direction', () => {
    render(<BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />)

    const labels = screen.getAllByTestId('mock-label')
    expect(labels.length).toBeGreaterThan(0)
  })

  it('should apply dir rtl to carousel for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    const { container } = render(
      <BlogTeaserSection data={mockSectionData} blogPosts={mockBlogPosts} direction={DirectionEnum.RTL} />
    )

    const carousel = container.querySelector('.snap-x')
    expect(carousel).toHaveAttribute('dir', 'rtl')
  })

  it('should apply dir ltr to carousel for LTR direction', () => {
    const { container } = render(
      <BlogTeaserSection direction={DirectionEnum.LTR} data={mockSectionData} blogPosts={mockBlogPosts} />
    )

    const carousel = container.querySelector('.snap-x')
    expect(carousel).toHaveAttribute('dir', 'ltr')
  })
})
