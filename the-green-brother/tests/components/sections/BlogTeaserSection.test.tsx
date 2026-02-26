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
    return <img src={props.src} alt={props.alt} className={props.className} data-fill={props.fill} />
  },
}))

// Mock BlogCard component
jest.mock('@/components/blog', () => ({
  BlogCard: function MockBlogCard({
    post,
    direction,
    basePath,
  }: {
    post: {
      documentId: string
      slug: string
      content?: { header?: { header?: { text?: string } } }
      tags?: { tag?: { text?: string } }[]
      wideImage?: { url?: string; alternativeText?: string }
      squareImage?: { url?: string; alternativeText?: string }
    }
    direction?: string
    basePath?: string
  }) {
    return (
      <a
        data-testid="mock-blog-card"
        href={`${basePath ?? '/blog'}/${post.slug}`}
        data-direction={direction}
        className="group"
      >
        <span data-testid="mock-blog-card-title">{post.content?.header?.header?.text}</span>
        {post.tags?.[0]?.tag?.text && <span data-testid="mock-blog-card-tag">{post.tags[0].tag.text}</span>}
      </a>
    )
  },
}))

// Mock the CMS element components
jest.mock('@/components/elements', () => ({
  Icon: function MockIcon({ icon, size, className }: { icon?: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  Text: function MockText({ text }: { text?: string }) {
    return <>{text}</>
  },
  Image: function MockImage({
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
    blogPosts: [],
  }

  const mockBlogPosts: ApiBlogPostBlogPostDocument[] = [
    {
      documentId: 'post-1',
      id: 1,
      slug: 'reduce-plastic-waste',
      readTimeInMinutes: 5,
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

      wideImage: {
        documentId: 'img-wide-1',
        id: 1,
        url: '/uploads/plastic-waste-wide.webp',
        name: 'plastic-waste-wide.webp',
        alternativeText: 'Plastic waste wide',
      } as any,
      squareImage: {
        documentId: 'img-square-1',
        id: 1,
        url: '/uploads/plastic-waste-square.webp',
        name: 'plastic-waste-square.webp',
        alternativeText: 'Plastic waste square',
      } as any,
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
      author: {
        documentId: 'auth-1',
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        slug: 'john-doe',
        bio: 'Bio',
        publishedAt: '2025-01-01',
        roles: [],
        seoMetadata: {
          metaTitle: 'John Doe',
          metaDescription: 'Author bio',
        },
      },
      seoMetadata: {
        metaTitle: '10 Ways to Reduce Plastic Waste',
        metaDescription: 'Tips for reducing plastic waste',
        metaImage: {
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
      } as any,
    },
    {
      documentId: 'post-2',
      id: 2,
      slug: 'sustainable-fashion-guide',
      readTimeInMinutes: 7,
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

      wideImage: {
        documentId: 'img-wide-2',
        id: 2,
        url: '/uploads/fashion-wide.webp',
        name: 'fashion-wide.webp',
        alternativeText: 'Fashion wide',
      } as any,
      squareImage: {
        documentId: 'img-square-2',
        id: 2,
        url: '/uploads/fashion-square.webp',
        name: 'fashion-square.webp',
        alternativeText: 'Fashion square',
      } as any,
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
      author: {
        documentId: 'auth-2',
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        slug: 'jane-smith',
        bio: 'Bio',
        publishedAt: '2025-01-01',
        roles: [],
        seoMetadata: {
          metaTitle: 'Jane Smith',
          metaDescription: 'Author bio',
        },
      },
      seoMetadata: {
        metaTitle: 'Sustainable Fashion Guide',
        metaDescription: 'Guide to sustainable fashion',
        metaImage: {
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
      } as any,
    },
  ]

  const mockSectionDataWithPosts: BlogTeaserSectionProps['data'] = {
    ...mockSectionData,
    blogPosts: mockBlogPosts,
  }

  const mockLabels = {
    readTimeMinutesLabel: {
      text: 'min read',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read time',
      id: 1,
    },
    readArticleLabel: {
      text: 'Read Article',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read full article',
      id: 2,
    },
  }

  const defaultProps = {
    ...mockLabels,
  }

  it('should render section with header text', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    expect(screen.getByRole('heading', { level: 3, name: 'From Our Blog' })).toBeInTheDocument()
  })

  it('should render view all button with correct alignment for LTR', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    const button = screen.getByRole('link', { name: 'View All Posts' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/blog')
    expect(button).toHaveClass('self-end')
  })

  it('should render view all button with correct alignment for RTL', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.RTL} data={mockSectionDataWithPosts} />)

    const button = screen.getByRole('link', { name: 'View All Posts' })
    expect(button).toHaveClass('self-end')
  })

  it('should render subheader when provided', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    expect(screen.getByText('Discover tips and stories to inspire your eco-friendly journey.')).toBeInTheDocument()
  })

  it('should not render subheader when not provided', () => {
    const { subheader: _subheader, ...headerWithoutSubheader } = mockSectionData.header
    const dataWithoutSubheader: BlogTeaserSectionProps['data'] = {
      ...mockSectionData,
      blogPosts: mockBlogPosts,
      header: headerWithoutSubheader,
    }

    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={dataWithoutSubheader} />)

    expect(
      screen.queryByText('Discover tips and stories to inspire your eco-friendly journey.')
    ).not.toBeInTheDocument()
  })

  it('should render all blog post titles', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    expect(screen.getByText('10 Ways to Reduce Plastic Waste')).toBeInTheDocument()
    expect(screen.getByText('Sustainable Fashion Guide')).toBeInTheDocument()
  })

  it('should render BlogCard for each blog post', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    const blogCards = screen.getAllByTestId('mock-blog-card')
    expect(blogCards).toHaveLength(2)
  })

  it('should render blog post tags via BlogCard', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    expect(screen.getByText('Sustainability')).toBeInTheDocument()
    expect(screen.getByText('Fashion')).toBeInTheDocument()
  })

  it('should render blog post links with correct href', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    const links = screen.getAllByRole('link')
    // Skip first link (view all button)
    expect(links[1]).toHaveAttribute('href', '/blog/reduce-plastic-waste')
    expect(links[2]).toHaveAttribute('href', '/blog/sustainable-fashion-guide')
  })

  it('should not render when blogPosts array is empty', () => {
    const { container } = render(
      <BlogTeaserSection
        readTimeMinutesLabel={mockLabels.readTimeMinutesLabel}
        readArticleLabel={mockLabels.readArticleLabel}
        direction={DirectionEnum.LTR}
        data={mockSectionData}
      />
    )

    expect(container.querySelector('section')).not.toBeInTheDocument()
  })

  it('should pass post data to BlogCard (image handling tested in BlogCard)', () => {
    const postsWithoutImage: ApiBlogPostBlogPostDocument[] = [
      {
        ...mockBlogPosts[0]!,
        wideImage: {
          ...mockBlogPosts[0]!.wideImage!,
          url: '',
        },
      },
    ]

    render(
      <BlogTeaserSection
        {...defaultProps}
        direction={DirectionEnum.LTR}
        data={{ ...mockSectionData, blogPosts: postsWithoutImage }}
      />
    )

    // BlogCard receives the post data, image handling is tested in BlogCard.test.tsx
    expect(screen.getByTestId('mock-blog-card')).toBeInTheDocument()
  })

  it('should pass post data to BlogCard (absolute URL handling tested in BlogCard)', () => {
    const postsWithAbsoluteUrl: ApiBlogPostBlogPostDocument[] = [
      {
        ...mockBlogPosts[0]!,
        wideImage: {
          ...mockBlogPosts[0]!.wideImage!,
          url: 'https://cdn.example.com/plastic-waste.webp',
        },
      },
    ]

    render(
      <BlogTeaserSection
        {...defaultProps}
        direction={DirectionEnum.LTR}
        data={{ ...mockSectionData, blogPosts: postsWithAbsoluteUrl }}
      />
    )

    // BlogCard receives the post data, URL handling is tested in BlogCard.test.tsx
    expect(screen.getByTestId('mock-blog-card')).toBeInTheDocument()
  })

  it('should pass post without tags to BlogCard', () => {
    const postsWithoutTags: ApiBlogPostBlogPostDocument[] = [{ ...mockBlogPosts[0]!, tags: [] }]

    render(
      <BlogTeaserSection
        {...defaultProps}
        direction={DirectionEnum.LTR}
        data={{ ...mockSectionData, blogPosts: postsWithoutTags }}
      />
    )

    // BlogCard should not render tag when not provided (mock shows no tag span)
    expect(screen.queryByTestId('mock-blog-card-tag')).not.toBeInTheDocument()
  })

  it('should pass post data to BlogCard (alt text handling tested in BlogCard)', () => {
    const { alternativeText: _alternativeText, ...imageWithoutAlt } = mockBlogPosts[0]!.wideImage!
    const postsWithoutAlt: ApiBlogPostBlogPostDocument[] = [
      {
        ...mockBlogPosts[0]!,
        wideImage: imageWithoutAlt as any,
      },
    ]

    render(
      <BlogTeaserSection
        {...defaultProps}
        direction={DirectionEnum.LTR}
        data={{ ...mockSectionData, blogPosts: postsWithoutAlt }}
      />
    )

    // BlogCard receives the post data, alt text handling is tested in BlogCard.test.tsx
    expect(screen.getByTestId('mock-blog-card')).toBeInTheDocument()
  })

  it('should have correct aria-label on section', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    const sections = screen.getAllByRole('region', { name: 'Blog posts section' })
    expect(sections.length).toBeGreaterThan(0)
    expect(sections[0]).toBeInTheDocument()
  })

  it('should handle missing aria-label on section', () => {
    const { header, ...restData } = mockSectionData
    const dataWithoutAria = {
      ...restData,
      blogPosts: mockBlogPosts,
      header: {
        ...header,
        header: { ...header.header, ariaDescription: undefined },
      },
    } as unknown as BlogTeaserSectionProps['data']

    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={dataWithoutAria} />)

    // Should default to empty string
    // Since role="region" requires label, it falls back to generic section.
    // We check attribute directly.
    // Query by class to find the section
    const section = screen.getByRole('heading', { level: 3 }).closest('section')
    expect(section).toHaveAttribute('aria-label', '')
  })

  it('should render BlogCard components (CTA tested in BlogCard)', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    // BlogCard components render read article CTA internally
    const blogCards = screen.getAllByTestId('mock-blog-card')
    expect(blogCards).toHaveLength(2)
  })

  it('should pass direction to BlogCard for RTL', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    render(<BlogTeaserSection {...defaultProps} data={mockSectionDataWithPosts} direction={DirectionEnum.RTL} />)

    const blogCards = screen.getAllByTestId('mock-blog-card')
    expect(blogCards.length).toBe(2)
    expect(blogCards[0]).toHaveAttribute('data-direction', 'rtl')
  })

  it('should pass direction to BlogCard for LTR', () => {
    render(<BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />)

    const blogCards = screen.getAllByTestId('mock-blog-card')
    expect(blogCards.length).toBeGreaterThan(0)
    expect(blogCards[0]).toHaveAttribute('data-direction', 'ltr')
  })

  it('should apply dir rtl to carousel for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    const { container } = render(
      <BlogTeaserSection {...defaultProps} data={mockSectionDataWithPosts} direction={DirectionEnum.RTL} />
    )

    const carousel = container.querySelector('.snap-x')
    expect(carousel).toHaveAttribute('dir', 'rtl')
  })

  it('should set dir="rtl" on section element for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    const { container } = render(
      <BlogTeaserSection {...defaultProps} data={mockSectionDataWithPosts} direction={DirectionEnum.RTL} />
    )

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('dir', 'rtl')
  })

  it('should set dir="ltr" on section element for LTR direction', () => {
    const { container } = render(
      <BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />
    )

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('dir', 'ltr')
  })

  it('should handle header with undefined header object (ariaDescription fallback on Carousel)', () => {
    const dataWithoutHeader: BlogTeaserSectionProps['data'] = {
      ...mockSectionData,
      blogPosts: mockBlogPosts,
      header: {
        ...mockSectionData.header,
        header: undefined,
      },
    } as unknown as BlogTeaserSectionProps['data']

    const { container } = render(
      <BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={dataWithoutHeader} />
    )

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('aria-label', '')
  })

  it('should apply dir ltr to carousel for LTR direction', () => {
    const { container } = render(
      <BlogTeaserSection {...defaultProps} direction={DirectionEnum.LTR} data={mockSectionDataWithPosts} />
    )

    const carousel = container.querySelector('.snap-x')
    expect(carousel).toHaveAttribute('dir', 'ltr')
  })
})
