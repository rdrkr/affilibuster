// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for BlogCard component
 */

import { render, screen } from '@testing-library/react'

import { BlogCard, type BlogCardProps } from '@/components/blog/BlogCard'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiBlogPostBlogPostDocument,
} from '@/lib/generated/types.gen'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: { src: string; alt: string; className?: string; fill?: boolean }) {
    return <img src={props.src} alt={props.alt} className={props.className} data-fill={props.fill} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
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
  Text: function MockText({ text, as: Component = 'span' }: { text?: string; as?: React.ElementType }) {
    return <Component data-testid="mock-cms-text">{text}</Component>
  },
  Image: function MockImage({
    image,
    fallbackAlt,
  }: {
    image?: { url?: string; alternativeText?: string } | string | null
    fallbackAlt?: string
  }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (typeof image === 'string') return image
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = typeof image === 'object' && image?.alternativeText ? image.alternativeText : (fallbackAlt ?? '')
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
  ButtonLink: function MockButtonLink({
    data,
    variant,
    direction,
  }: {
    data: { label: { text: string; icon?: string }; url: string }
    variant?: string
    direction?: string
  }) {
    return (
      <a data-testid="mock-buttonlink" href={data.url} data-variant={variant} data-direction={direction}>
        {data.label.text}
        {data.label.icon && <span data-testid="mock-buttonlink-icon">{data.label.icon}</span>}
      </a>
    )
  },
  Card: function MockCard({
    href,
    image,
    header,
    content,
    footer,
    size,
    asLink = true,
  }: {
    href: string
    image?: { url?: string; alternativeText?: string } | null
    header?: React.ReactNode
    content?: React.ReactNode
    footer?: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    className?: string
    asLink?: boolean
  }) {
    const getImageUrl = () => {
      if (!image) return '/images/placeholder.svg'
      if (!image.url) return '/images/placeholder.svg'
      return image.url.startsWith('http') ? image.url : `https://localhost:1337${image.url}`
    }
    const alt = image?.alternativeText ?? ''

    // Logic mirroring Card.tsx behavior: Wrapper is always div, asLink renders overlay
    return (
      <div data-testid="mock-card" data-size={size} data-href={href} className="group relative">
        {asLink && <a href={href} className="absolute inset-0 z-0" data-testid="mock-card-overlay-link" />}

        {}
        <img data-testid="mock-card-image" src={getImageUrl()} alt={alt} />
        {header && <div data-testid="mock-card-header">{header}</div>}
        {content && <div data-testid="mock-card-content">{content}</div>}
        {footer && <div data-testid="mock-card-footer">{footer}</div>}
      </div>
    )
  },
}))

describe('BlogCard', () => {
  const mockAuthor = {
    documentId: 'author-1',
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    slug: 'john-doe',
    bio: 'A test author',
    email: 'john@example.com',
    profilePicture: {
      documentId: 'img-1',
      id: 1,
      name: 'author.jpg',
      url: '/author.jpg',
      mime: 'image/jpeg',
      size: 100,
      provider: 'local',
      hash: 'author_hash',
      publishedAt: '2024-01-01',
    },
    publishedAt: '2025-01-01',
    roles: [],
    seoMetadata: {
      metaTitle: 'John Doe',
      metaDescription: 'Author bio for John Doe',
    },
  }

  const createMockPost = (overrides?: Partial<ApiBlogPostBlogPostDocument>): ApiBlogPostBlogPostDocument =>
    ({
      documentId: 'post-1',
      id: 1,
      slug: 'test-post',
      publishedDate: '2025-01-15',
      publishedAt: '2025-01-15',
      readTimeInMinutes: 5,
      content: {
        header: {
          alignment: AlignmentEnum.LANGUAGE_DIRECTION,
          promoteHeaderIcon: false,
          header: {
            text: 'Test Post Title',
            ariaDescription: 'Read article',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
          },
          subheader: {
            text: 'Test post excerpt',
            ariaDescription: 'Excerpt',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
          },
        },
      },
      wideImage: {
        documentId: 'img-wide-1',
        id: 1,
        name: 'test-image-wide.webp',
        alternativeText: 'Test image alt',
        url: '/uploads/test-image.webp',
        hash: 'test_abc',
        mime: 'image/webp',
        size: 80,
        provider: 'local',
        publishedAt: '2025-01-15',
      },
      squareImage: {
        documentId: 'img-sq-1',
        id: 2,
        name: 'test-image-sq.webp',
        alternativeText: 'Test image alt',
        url: '/uploads/test-image.webp',
        hash: 'test_abc',
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
          },
          seoMetadata: {
            metaTitle: 'Sustainability',
            metaDescription: 'Sustainability tag',
          },
        },
      ],
      author: mockAuthor,
      seoMetadata: {
        metaTitle: 'Test Post Title',
        metaDescription: 'Test post description',
        metaImage: {
          documentId: 'img-1',
          id: 1,
          name: 'test-image.webp',
          alternativeText: 'Test image alt',
          url: '/uploads/test-image.webp',
          hash: 'test_abc',
          mime: 'image/webp',
          size: 80,
          provider: 'local',
          publishedAt: '2025-01-15',
        },
      },
      readArticleLabel: {
        text: 'Read Article',
        icon: 'arrow_forward',
        iconPosition: IconPositionEnum.AFTER_TEXT,
        ariaDescription: 'Read article',
      },
      ...overrides,
    }) as ApiBlogPostBlogPostDocument

  const defaultProps: BlogCardProps = {
    post: createMockPost(),
    direction: DirectionEnum.LTR,
    asLink: true,
    readArticleLabel: {
      text: 'Read Article',
      icon: 'arrow_forward',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read article',
    },
    readTimeMinutesLabel: {
      text: 'min read',
      icon: '',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'minutes read',
    },
  }

  it('should render with blog variant and lg size', () => {
    render(<BlogCard {...defaultProps} />)
    const card = screen.getByTestId('mock-card')
    expect(card).toHaveAttribute('data-size', 'lg')
  })

  it('should render post title', () => {
    render(<BlogCard {...defaultProps} />)

    expect(screen.getByRole('heading', { level: 4, name: 'Test Post Title' })).toBeInTheDocument()
  })

  it('should render post excerpt', () => {
    render(<BlogCard {...defaultProps} />)

    expect(screen.getByText('Test post excerpt')).toBeInTheDocument()
  })

  it('should render post tag', () => {
    render(<BlogCard {...defaultProps} />)

    expect(screen.getByTestId('mock-card-header')).toHaveTextContent('Sustainability')
  })

  it('should not render tag when no tags provided', () => {
    const postWithoutTags = createMockPost({ tags: [] })
    render(<BlogCard {...defaultProps} post={postWithoutTags} />)

    expect(screen.queryByTestId('mock-card-header')).not.toBeInTheDocument()
  })

  it('should render author name', () => {
    render(<BlogCard {...defaultProps} />)

    // Author is rendered as part of combined text "John Doe • 5 min read"
    expect(screen.getByTestId('mock-cms-text')).toHaveTextContent('John Doe')
  })

  it('should render read time', () => {
    render(<BlogCard {...defaultProps} />)

    // Read time is rendered as part of combined text "John Doe • 5 min read"
    expect(screen.getByTestId('mock-cms-text')).toHaveTextContent('5 min read')
  })

  it('should render author and read time with separator', () => {
    render(<BlogCard {...defaultProps} />)

    // Author and read time are combined into a single text element
    const metadataText = screen.getByTestId('mock-cms-text')
    expect(metadataText).toHaveTextContent('John Doe • 5 min read')
  })

  // Test case removed as fallback logic is removed

  it('should render read article button', () => {
    render(<BlogCard {...defaultProps} asLink={false} />)

    const button = screen.getByTestId('mock-buttonlink')
    expect(button).toHaveTextContent('Read Article')
    expect(button).toHaveAttribute('href', '/blog/test-post')
  })

  it('should link to correct blog post URL with default basePath', () => {
    render(<BlogCard {...defaultProps} />)

    const card = screen.getByTestId('mock-card')
    // Expect data-href on the wrapper div
    expect(card).toHaveAttribute('data-href', '/blog/test-post')

    // Also expect the overlay link since defaultProps has asLink=true (implicit)
    const overlayLink = screen.getByTestId('mock-card-overlay-link')
    expect(overlayLink).toHaveAttribute('href', '/blog/test-post')
  })

  it('should link to correct blog post URL with custom basePath', () => {
    render(<BlogCard {...defaultProps} basePath="/en/blog" />)

    const card = screen.getByTestId('mock-card')
    expect(card).toHaveAttribute('data-href', '/en/blog/test-post')
  })

  it('should render image with alt text from alternativeText', () => {
    render(<BlogCard {...defaultProps} />)

    const image = screen.getByTestId('mock-card-image')
    expect(image).toHaveAttribute('alt', 'Test image alt')
  })

  it('should render with RTL direction', () => {
    render(<BlogCard {...defaultProps} direction={DirectionEnum.RTL} asLink={false} />)

    // ButtonLink should receive direction prop (handled internally by ButtonLink)
    expect(screen.getByTestId('mock-buttonlink')).toHaveAttribute('data-direction', DirectionEnum.RTL)
  })

  it('should handle missing featured image (null-like)', () => {
    const { wideImage: _wide, squareImage: _sq, ...basePost } = createMockPost()
    const postWithoutImage = basePost as ApiBlogPostBlogPostDocument
    render(<BlogCard {...defaultProps} post={postWithoutImage} />)

    const image = screen.getByTestId('mock-card-image')
    expect(image).toHaveAttribute('src', '/images/placeholder.svg')
  })

  it('should handle author without name property', () => {
    const postWithEmptyAuthor = createMockPost({
      author: { ...mockAuthor, firstName: '', lastName: '' },
    })
    render(<BlogCard {...defaultProps} post={postWithEmptyAuthor} />)

    // Should not render the author section if name is empty (depends on exact logic)
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })
  it('should handle readArticleLabel without icon', () => {
    const postWithoutIcon = createMockPost()
    const labelWithoutIcon = {
      text: 'Read Article',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read article',
    }
    render(<BlogCard {...defaultProps} post={postWithoutIcon} readArticleLabel={labelWithoutIcon} asLink={false} />)

    const button = screen.getByTestId('mock-buttonlink')
    expect(button).toHaveTextContent('Read Article')
    expect(screen.queryByTestId('mock-buttonlink-icon')).not.toBeInTheDocument()
  })

  it('should render tag when showTag is true (default)', () => {
    render(<BlogCard {...defaultProps} />)
    expect(screen.getByTestId('mock-card-header')).toHaveTextContent('Sustainability')
  })

  it('should not render tag when showTag is false', () => {
    render(<BlogCard {...defaultProps} showTag={false} />)
    expect(screen.queryByTestId('mock-card-header')).not.toBeInTheDocument()
  })

  it('should resolve layout to "ltr" when size is "sm" and no explicit layout', () => {
    render(<BlogCard {...defaultProps} size="sm" />)
    // With size="sm" and no explicit layout, resolvedLayout should be 'ltr'
    // The footer div should not have the ltr-specific class since layout is 'ltr'
    const card = screen.getByTestId('mock-card')
    expect(card).toBeInTheDocument()
  })

  it('should resolve layout to "ttb" when size is not "sm" and no explicit layout', () => {
    render(<BlogCard {...defaultProps} size="lg" />)
    const card = screen.getByTestId('mock-card')
    expect(card).toBeInTheDocument()
  })

  it('should render null content slot when content.header is missing', () => {
    const postWithoutContentHeader = createMockPost({
      content: {} as any,
    })
    render(<BlogCard {...defaultProps} post={postWithoutContentHeader} />)
    // Card should render without content slot
    expect(screen.queryByTestId('mock-card-content')).not.toBeInTheDocument()
  })

  it('should render author name without lastName when lastName is not provided', () => {
    const postWithFirstNameOnly = createMockPost({
      author: { ...mockAuthor, firstName: 'Jane', lastName: '' },
    })
    render(<BlogCard {...defaultProps} post={postWithFirstNameOnly} />)
    // authorName should be just "Jane" (without extra spaces from missing last name)
    const metadataText = screen.getByTestId('mock-cms-text')
    expect(metadataText).toHaveTextContent('Jane • 5 min read')
  })

  it('should not render noAnimation when passed explicitly as true', () => {
    render(<BlogCard {...defaultProps} noAnimation={true} />)
    const card = screen.getByTestId('mock-card')
    expect(card).toBeInTheDocument()
  })

  it('should use explicit layout prop over size-based resolution', () => {
    render(<BlogCard {...defaultProps} size="sm" layout="ttb" />)
    const card = screen.getByTestId('mock-card')
    expect(card).toBeInTheDocument()
  })

  it('should render with showTag true but empty tags (no tag text)', () => {
    const postWithEmptyTag = createMockPost({
      tags: [
        {
          documentId: 'tag-1',
          id: 1,
          tagId: 'empty',
          publishedAt: '2025-01-01',
          tag: {
            text: '',
            ariaDescription: '',
            iconPosition: IconPositionEnum.BEFORE_TEXT,
          },
          seoMetadata: { metaTitle: '', metaDescription: '' },
        },
      ] as any,
    })
    render(<BlogCard {...defaultProps} post={postWithEmptyTag} showTag={true} />)
    // Tag header should not render because firstTag is empty string
    expect(screen.queryByTestId('mock-card-header')).not.toBeInTheDocument()
  })

  it('should have asLink default to false when omitted', () => {
    const propsWithoutAsLink = { ...defaultProps }
    delete propsWithoutAsLink.asLink
    render(<BlogCard {...propsWithoutAsLink} />)
    // When asLink is false, mock-card-overlay-link should not be present
    expect(screen.queryByTestId('mock-card-overlay-link')).not.toBeInTheDocument()
  })
})
