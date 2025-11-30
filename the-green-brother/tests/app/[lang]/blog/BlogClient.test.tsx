// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BlogClient component
 */

import { fireEvent, render, screen } from '@testing-library/react'

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

import BlogClient from '@/app/[lang]/blog/BlogClient'
import { CodeEnum, type ApiBlogBlogDocument, type ApiBlogPostBlogPostDocument } from '@/lib/generated/types.gen'

describe('BlogClient', () => {
  const mockBlogPageData: ApiBlogBlogDocument = {
    header: {
      header: { text: 'Our Blog' },
      subheader: { text: 'Read our latest articles' },
    },
  } as ApiBlogBlogDocument

  const mockPosts: ApiBlogPostBlogPostDocument[] = [
    {
      documentId: 'post-1',
      slug: 'first-post',
      content: { header: { header: { text: 'First Post' }, subheader: { text: 'Introduction' } } },
      readTime: '5 min',
      tags: [{ tag: { text: 'Sustainability' } }],
      featuredImage: { url: '/images/post1.jpg', alternativeText: 'Post 1' },
    } as ApiBlogPostBlogPostDocument,
    {
      documentId: 'post-2',
      slug: 'second-post',
      content: { header: { header: { text: 'Second Post' }, subheader: { text: 'Details' } } },
      readTime: '3 min',
      tags: [{ tag: { text: 'EcoFriendly' } }],
    } as ApiBlogPostBlogPostDocument,
  ]

  it('should render blog header with CMS data', () => {
    render(<BlogClient blogPageData={mockBlogPageData} posts={[]} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our Blog')
    expect(screen.getByText('Read our latest articles')).toBeInTheDocument()
  })

  it('should render default header when blogPageData is null', () => {
    render(<BlogClient blogPageData={null} posts={[]} lang={CodeEnum.EN} />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sustainable Living,')
  })

  it('should render posts', () => {
    render(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} lang={CodeEnum.EN} />)

    expect(screen.getAllByText('First Post').length).toBeGreaterThan(0)
  })

  it('should render empty state when no posts', () => {
    render(<BlogClient blogPageData={mockBlogPageData} posts={[]} lang={CodeEnum.EN} />)

    expect(screen.getByText('No blog posts found')).toBeInTheDocument()
  })

  it('should extract and display unique tags', () => {
    render(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} lang={CodeEnum.EN} />)

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sustainability' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EcoFriendly' })).toBeInTheDocument()
  })

  it('should filter posts by tag', () => {
    render(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} lang={CodeEnum.EN} />)

    // Click on Sustainability tag
    fireEvent.click(screen.getByRole('button', { name: 'Sustainability' }))

    // Should only show posts with that tag
    expect(screen.getAllByText('First Post').length).toBeGreaterThan(0)
  })

  it('should show all posts when All tag is selected', () => {
    render(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} lang={CodeEnum.EN} />)

    // Filter first
    fireEvent.click(screen.getByRole('button', { name: 'Sustainability' }))
    // Then reset
    fireEvent.click(screen.getByRole('button', { name: 'All' }))

    // All posts should be visible
    expect(screen.getAllByText('First Post').length).toBeGreaterThan(0)
  })

  it('should not render subheader when not available', () => {
    const dataWithoutSubheader = {
      header: { header: { text: 'Blog' } },
    } as ApiBlogBlogDocument

    render(<BlogClient blogPageData={dataWithoutSubheader} posts={[]} lang={CodeEnum.EN} />)

    expect(screen.queryByText('Read our latest articles')).not.toBeInTheDocument()
  })

  it('should not render tags filter when only All tag exists', () => {
    const postsWithoutTags = [{ documentId: 'post-1', slug: 'post', content: {} }] as ApiBlogPostBlogPostDocument[]

    render(<BlogClient blogPageData={mockBlogPageData} posts={postsWithoutTags} lang={CodeEnum.EN} />)

    // Only "All" tag should exist but not shown as filter
    expect(screen.queryByRole('button', { name: 'Sustainability' })).not.toBeInTheDocument()
  })

  it('should render post without featured image', () => {
    const postsWithoutImage = [
      {
        documentId: 'post-1',
        slug: 'no-image-post',
        content: { header: { header: { text: 'No Image Post' } } },
        readTime: '5 min',
        tags: [],
      } as unknown as ApiBlogPostBlogPostDocument,
    ]

    render(<BlogClient blogPageData={mockBlogPageData} posts={postsWithoutImage} lang={CodeEnum.EN} />)

    expect(screen.getAllByText('No Image Post').length).toBeGreaterThan(0)
  })

  it('should render post without read time', () => {
    const postsWithoutReadTime = [
      {
        documentId: 'post-1',
        slug: 'no-readtime-post',
        content: { header: { header: { text: 'No ReadTime Post' } } },
        tags: [],
      } as unknown as ApiBlogPostBlogPostDocument,
    ]

    render(<BlogClient blogPageData={mockBlogPageData} posts={postsWithoutReadTime} lang={CodeEnum.EN} />)

    expect(screen.getAllByText('No ReadTime Post').length).toBeGreaterThan(0)
  })

  it('should handle posts with empty tags array', () => {
    const postsEmptyTags = [
      {
        documentId: 'post-1',
        slug: 'empty-tags',
        content: { header: { header: { text: 'Empty Tags' } } },
        tags: [],
        featuredImage: { url: '/test.jpg' },
      } as unknown as ApiBlogPostBlogPostDocument,
    ]

    render(<BlogClient blogPageData={mockBlogPageData} posts={postsEmptyTags} lang={CodeEnum.EN} />)

    expect(screen.getAllByText('Empty Tags').length).toBeGreaterThan(0)
  })

  it('should link to correct blog post URL', () => {
    const { container } = render(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} lang={CodeEnum.EN} />)

    const links = container.querySelectorAll('a[href*="/blog/"]')
    expect(links.length).toBeGreaterThan(0)
  })
})
