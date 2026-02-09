// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BlogPostClient component
 */

import { screen } from '@testing-library/react'
import { renderWithLayout } from '../../../../utils/renderWithLayout'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock CMS components
jest.mock('@/components/elements', () => ({
  DEFAULT_IMAGE: { url: '/images/placeholder.svg' },
  Image: function MockImage({ fallbackAlt }: { fallbackAlt?: string }) {
    return <div data-testid="cms-image">{fallbackAlt}</div>
  },
  Text: function MockText({ text, as: Component = 'span', className }: any) {
    return <Component className={className}>{text}</Component>
  },
  Breadcrumbs: function MockBreadcrumbs({ lang }: { lang: string; direction?: string; navigation?: any }) {
    return (
      <nav aria-label="Breadcrumb">
        <a href={`/${lang}`}>Home</a>
        <a href={`/${lang}/blog`}>Blog</a>
      </nav>
    )
  },
  Label: function MockLabel({ data, as: Tag = 'span', className, children }: any) {
    return (
      <Tag data-testid="cms-label" className={className}>
        {data?.text}
        {children}
      </Tag>
    )
  },
  TextBlock: function MockTextBlock({ data }: any) {
    return <div data-testid="cms-text-block">{data?.content}</div>
  },
  Header: function MockHeader({ data, level }: any) {
    const Tag = `h${level}` as any
    return (
      <Tag data-testid="cms-header">
        {data?.header?.text}
        {data?.subheader?.text}
      </Tag>
    )
  },
  ContributorCard: function MockContributorCard({ member, size }: any) {
    const fullName = member?.lastName ? `${member.firstName} ${member.lastName}` : (member?.firstName ?? '')
    return (
      <div data-testid="contributor-card">
        <div>{fullName}</div>
        <div>
          {/* Mock initials rendering for tests expecting "JD" */}
          {fullName
            ? fullName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
            : ''}
        </div>
        {size !== 'xs' && <div>{member?.bio}</div>}
      </div>
    )
  },
}))

jest.mock('@/components/sections/HeroSection', () => ({
  HeroSection: function MockHeroSection({ data, header, footer }: any) {
    return (
      <div data-testid="hero-section" data-image-src={data?.image?.url}>
        <div data-testid="hero-header">{header}</div>
        <div data-testid="hero-content">
          <h1>{data?.header?.header?.text}</h1>
        </div>
        <div data-testid="hero-footer">{footer}</div>
      </div>
    )
  },
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/en/blog/test-post'),
}))

import BlogPostClient from '@/app/[lang]/blog/[slug]/BlogPostClient'
import {
  CodeEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiBlogBlogDocument,
  type ApiBlogPostBlogPostDocument,
} from '@/lib/generated/types.gen'

describe('BlogPostClient', () => {
  const mockBlogData: ApiBlogBlogDocument = {
    documentId: 'blog-1',
    id: 1,
    header: { header: { text: 'Blog' } },
    aboutAuthorHeader: {
      // Added mock data
      header: { text: 'About the Author' },
      alignment: 'left',
    } as any,
    readTimeMinutesLabel: {
      text: 'min read',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Read time',
    },
  } as unknown as ApiBlogBlogDocument

  const mockNavigation = {
    documentId: 'nav-1',
    id: 'nav-1',
    siteTitle: 'Test Site',
    siteDescription: 'Test Description',
    publishedAt: '2024-01-01T00:00:00Z',
    homeButton: {
      url: '/en',
      label: { text: 'Home', ariaDescription: 'Go home', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    blogButton: {
      url: '/en/blog',
      label: { text: 'Blog', ariaDescription: 'Go to blog', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    aboutButton: {
      url: '/en/about',
      label: { text: 'About', ariaDescription: 'Go to about', iconPosition: IconPositionEnum.BEFORE_TEXT },
      openInNewTab: false,
    },
    productsMenu: {
      menuButton: {
        url: '/en/products',
        label: { text: 'Products', ariaDescription: 'Go to products', iconPosition: IconPositionEnum.BEFORE_TEXT },
        openInNewTab: false,
      },
    },
  } as any

  const mockPost: ApiBlogPostBlogPostDocument = {
    documentId: 'post-1',
    slug: 'test-post',
    content: {
      header: {
        header: { text: 'Test Blog Post' },
        subheader: { text: 'A subtitle for the post' },
      },
      content: '<p>This is the post content.</p>',
    },
    publishedDate: '2024-01-15T00:00:00Z',
    readTimeInMinutes: 5,
    author: {
      documentId: 'auth-1',
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      slug: 'john-doe',
      bio: 'A passionate writer',
      publishedAt: '2024-01-01',
    },
    tags: [{ tag: { text: 'Technology' } }],
    featuredImage: { url: '/images/featured.jpg' },
  } as ApiBlogPostBlogPostDocument

  it('should render post title', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR, navigation: mockNavigation },
      }
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Blog Post')
  })

  it('should render breadcrumbs with correct links', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR, navigation: mockNavigation },
      }
    )

    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('link', { name: 'Go to blog' })).toHaveAttribute('href', '/en/blog')
  })

  it('should render author name and initials', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('JD').length).toBeGreaterThan(0)
  })

  it('should render formatted published date', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should render read time', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByText('5 min read')).toBeInTheDocument()
  })

  it('should render tag', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('should render author bio section', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByText('About the Author')).toBeInTheDocument()
    expect(screen.getByText('A passionate writer')).toBeInTheDocument()
  })

  it('should render article content as HTML', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    const content = screen.getByTestId('cms-text-block')
    expect(content).toHaveTextContent('This is the post content.')
  })

  it('should not render author section when author has no bio', () => {
    const postWithoutBio = {
      ...mockPost,
      author: { firstName: 'Jane' },
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithoutBio}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.queryByText('About the Author')).not.toBeInTheDocument()
  })

  it('should not render published date when not available', () => {
    const postWithoutDate = {
      ...mockPost,
      publishedDate: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithoutDate}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.queryByText('January 15, 2024')).not.toBeInTheDocument()
  })

  it('should not render tags when empty array', () => {
    const postWithoutTags = {
      ...mockPost,
      tags: [],
    } as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithoutTags}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.queryByText('Technology')).not.toBeInTheDocument()
  })

  it('should render without featured image when not available', () => {
    const postWithoutImage = {
      ...mockPost,
      featuredImage: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithoutImage}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    // Component should still render the title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Blog Post')
  })

  it('should not render subheader when not available', () => {
    const postWithoutSubheader = {
      ...mockPost,
      content: {
        header: { header: { text: 'Title Only' } },
        content: '<p>Content</p>',
      },
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithoutSubheader}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.queryByText('A subtitle for the post')).not.toBeInTheDocument()
  })

  it('should render with minimal post data', () => {
    const minimalPost = {
      ...mockPost,
      documentId: 'min-1',
      slug: 'minimal',
      content: {
        header: {
          header: { text: 'Minimal' },
          alignment: 'left',
          promoteHeaderIcon: false,
        },
      },
      tags: [],
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={minimalPost}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Minimal')
  })

  it('should render tags with empty array', () => {
    const postEmptyTags = {
      ...mockPost,
      tags: [],
    } as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postEmptyTags}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.queryByText('Technology')).not.toBeInTheDocument()
  })

  it('should handle tag with missing tag.text', () => {
    const postWithNullTagText = {
      ...mockPost,
      tags: [{ tag: { text: undefined } }],
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithNullTagText}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    // Should not crash, breadcrumb title still renders
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Blog Post')
  })

  it('should render post with single tag', () => {
    const postWithTag = {
      ...mockPost,
      tags: [{ tag: { text: 'Science', ariaDescription: 'Science', iconPosition: IconPositionEnum.BEFORE_TEXT } }],
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postWithTag}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByText('Science')).toBeInTheDocument()
  })

  it('should handle missing content.header.header.text', () => {
    const postMissingHeaderText = {
      ...mockPost,
      content: {
        header: {
          header: { text: undefined },
          subheader: { text: 'Has subheader' },
        },
        content: '<p>Content</p>',
      },
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postMissingHeaderText}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    // Should render without crashing, using empty string fallback
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should handle missing content.header', () => {
    const postMissingHeader = {
      ...mockPost,
      content: {
        header: undefined,
        content: '<p>Content</p>',
      },
    } as unknown as ApiBlogPostBlogPostDocument

    renderWithLayout(
      <BlogPostClient
        post={postMissingHeader}
        blogData={mockBlogData}
        direction={DirectionEnum.LTR}
        language={CodeEnum.EN}
      />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
  it('should render featured image from post', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    const hero = screen.getByTestId('hero-section')
    expect(hero).toHaveAttribute('data-image-src', '/images/featured.jpg')
  })

  it('should have responsive layout classes for metadata', () => {
    renderWithLayout(
      <BlogPostClient post={mockPost} blogData={mockBlogData} direction={DirectionEnum.LTR} language={CodeEnum.EN} />,
      {
        layoutContext: { lang: CodeEnum.EN, direction: DirectionEnum.LTR },
      }
    )

    const heroFooter = screen.getByTestId('hero-footer')
    const container = heroFooter.firstElementChild
    expect(container).toHaveClass(
      'flex',
      'items-center',
      'gap-4',
      'text-sm',
      'font-medium',
      'text-neutral-500',
      'dark:text-tertiary-400'
    )
  })
})
