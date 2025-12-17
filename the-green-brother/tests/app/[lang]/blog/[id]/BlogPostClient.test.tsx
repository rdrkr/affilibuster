// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BlogPostClient component
 */

import { render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock CMS components
jest.mock('@/components/elements', () => ({
  CMSImage: function MockCMSImage({ fallbackAlt }: { fallbackAlt?: string }) {
    return <div data-testid="cms-image">{fallbackAlt}</div>
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <span>{text}</span>
  },
}))

import BlogPostClient from '@/app/[lang]/blog/[id]/BlogPostClient'
import { CodeEnum, type ApiBlogPostBlogPostDocument } from '@/lib/generated/types.gen'

describe('BlogPostClient', () => {
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
    readTime: '5',
    author: { name: 'John Doe', bio: 'A passionate writer' },
    tags: [{ tag: { text: 'Technology' } }],
    featuredImage: { url: '/images/featured.jpg' },
  } as ApiBlogPostBlogPostDocument

  it('should render post title', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Blog Post')
  })

  it('should render breadcrumbs with correct links', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/en/blog')
  })

  it('should render author name and initials', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('JD').length).toBeGreaterThan(0)
  })

  it('should render formatted published date', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should render read time', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getByText('5 min read')).toBeInTheDocument()
  })

  it('should render tag', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('should render author bio section', () => {
    render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    expect(screen.getByText('About the Author')).toBeInTheDocument()
    expect(screen.getByText('A passionate writer')).toBeInTheDocument()
  })

  it('should render article content as HTML', () => {
    const { container } = render(<BlogPostClient post={mockPost} lang={CodeEnum.EN} />)

    const content = container.querySelector('[class*="prose"]')
    expect(content).toHaveTextContent('This is the post content.')
  })

  it('should not render author section when author has no bio', () => {
    const postWithoutBio = {
      ...mockPost,
      author: { name: 'Jane' },
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithoutBio} lang={CodeEnum.EN} />)

    expect(screen.queryByText('About the Author')).not.toBeInTheDocument()
  })

  it('should not render read time when not available', () => {
    const postWithoutReadTime = {
      ...mockPost,
      readTime: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithoutReadTime} lang={CodeEnum.EN} />)

    expect(screen.queryByText(/min read/)).not.toBeInTheDocument()
  })

  it('should not render published date when not available', () => {
    const postWithoutDate = {
      ...mockPost,
      publishedDate: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithoutDate} lang={CodeEnum.EN} />)

    expect(screen.queryByText('January 15, 2024')).not.toBeInTheDocument()
  })

  it('should not render tags when not available', () => {
    const postWithoutTags = {
      ...mockPost,
      tags: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithoutTags} lang={CodeEnum.EN} />)

    expect(screen.queryByText('Technology')).not.toBeInTheDocument()
  })

  it('should render without featured image when not available', () => {
    const postWithoutImage = {
      ...mockPost,
      featuredImage: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithoutImage} lang={CodeEnum.EN} />)

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

    render(<BlogPostClient post={postWithoutSubheader} lang={CodeEnum.EN} />)

    expect(screen.queryByText('A subtitle for the post')).not.toBeInTheDocument()
  })

  it('should handle post without author', () => {
    const postWithoutAuthor = {
      ...mockPost,
      author: undefined,
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithoutAuthor} lang={CodeEnum.EN} />)

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('should render with minimal post data', () => {
    const minimalPost = {
      documentId: 'min-1',
      slug: 'minimal',
      content: { header: { header: { text: 'Minimal' } } },
    } as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={minimalPost} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Minimal')
  })

  it('should render tags with empty array', () => {
    const postEmptyTags = {
      ...mockPost,
      tags: [],
    } as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postEmptyTags} lang={CodeEnum.EN} />)

    expect(screen.queryByText('Technology')).not.toBeInTheDocument()
  })

  it('should handle tag with missing tag.text', () => {
    const postWithNullTagText = {
      ...mockPost,
      tags: [{ tag: { text: undefined } }],
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithNullTagText} lang={CodeEnum.EN} />)

    // Should not crash, breadcrumb title still renders
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Blog Post')
  })

  it('should handle tag with null tag object', () => {
    const postWithNullTag = {
      ...mockPost,
      tags: [{ tag: null }],
    } as unknown as ApiBlogPostBlogPostDocument

    render(<BlogPostClient post={postWithNullTag} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Blog Post')
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

    render(<BlogPostClient post={postMissingHeaderText} lang={CodeEnum.EN} />)

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

    render(<BlogPostClient post={postMissingHeader} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
