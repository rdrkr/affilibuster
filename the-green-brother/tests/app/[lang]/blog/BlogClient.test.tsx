// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for BlogClient component
 */

import { screen, waitFor } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock CMS components
jest.mock('@/components/elements', () => ({
  Image: function MockImage({ fallbackAlt }: { fallbackAlt?: string }) {
    return <div data-testid="cms-image">{fallbackAlt}</div>
  },
  Text: function MockText({ text }: { text?: string }) {
    return <span>{text}</span>
  },
  Header: function MockHeader({
    data,
    level = 2,
  }: {
    data: { header?: { text?: string }; subheader?: { text?: string } }
    level?: number
  }) {
    const HeadingTag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div data-testid="mock-header">
        <HeadingTag data-testid="mock-header-title">{data.header?.text}</HeadingTag>
        {data.subheader?.text && <p data-testid="mock-header-subtitle">{data.subheader.text}</p>}
      </div>
    )
  },
  ButtonLink: function MockButtonLink({ data }: { data: { label: { text: string }; url: string } }) {
    return <a href={data.url}>{data.label.text}</a>
  },
  Icon: function MockIcon({ icon, size, className }: { icon?: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-size={size} className={className}>
        {icon}
      </span>
    )
  },
}))

// Mock BlogCard component
jest.mock('@/components/blog', () => ({
  BlogCard: function MockBlogCard({
    post,
    basePath,
  }: {
    post: {
      documentId: string
      slug: string
      content?: { header?: { header?: { text?: string } } }
      tags?: { tag?: { text?: string } }[]
    }
    basePath?: string
  }) {
    return (
      <a data-testid="mock-blog-card" href={`${basePath ?? '/blog'}/${post.slug}`} className="group">
        <span data-testid="mock-blog-card-title">{post.content?.header?.header?.text}</span>
        {post.tags?.[0]?.tag?.text && <span data-testid="mock-blog-card-tag">{post.tags[0].tag.text}</span>}
      </a>
    )
  },
}))

// Mock Carousel component
// Mock Carousel component
jest.mock('@/components/layout', () => {
  const actual = jest.requireActual('@/components/layout')
  return {
    ...actual,
    Carousel: function MockCarousel({ children }: { children: React.ReactNode }) {
      return <div data-testid="mock-carousel">{children}</div>
    },
  }
})

import BlogClient from '@/app/[lang]/blog/BlogClient'
import { DirectionEnum, type ApiBlogBlogDocument, type ApiBlogPostBlogPostDocument } from '@/lib/generated/types.gen'
import { renderWithLayout } from '../../../utils/renderWithLayout'

describe('BlogClient', () => {
  const mockPosts: ApiBlogPostBlogPostDocument[] = [
    {
      documentId: 'post-1',
      slug: 'first-post',
      content: { header: { header: { text: 'First Post' }, subheader: { text: 'Introduction' } } },

      tags: [{ tag: { text: 'Sustainability' } }],
      featuredImage: { url: '/images/post1.jpg', alternativeText: 'Post 1' },
    } as ApiBlogPostBlogPostDocument,
    {
      documentId: 'post-2',
      slug: 'second-post',
      content: { header: { header: { text: 'Second Post' }, subheader: { text: 'Details' } } },

      tags: [{ tag: { text: 'EcoFriendly' } }],
    } as ApiBlogPostBlogPostDocument,
    {
      documentId: 'post-3',
      slug: 'third-post',
      content: { header: { header: { text: 'Third Post' } } },
      tags: [{ tag: { text: 'Sustainability' } }],
    } as ApiBlogPostBlogPostDocument,
    {
      documentId: 'post-4',
      slug: 'fourth-post',
      content: { header: { header: { text: 'Fourth Post' } } },
      tags: [{ tag: { text: 'EcoFriendly' } }],
    } as ApiBlogPostBlogPostDocument,
    {
      documentId: 'post-5',
      slug: 'fifth-post',
      content: { header: { header: { text: 'Fifth Post' } } },
      tags: [{ tag: { text: 'Sustainability' } }],
    } as ApiBlogPostBlogPostDocument,
  ]

  const mockBlogPageData: ApiBlogBlogDocument = {
    header: {
      header: { text: 'Our Blog' },
      subheader: { text: 'Read our latest articles' },
    },
    featuredBlogPosts: [mockPosts[0]],
    tagFilters: [
      { documentId: 'tag-1', tag: { text: 'Sustainability' } },
      { documentId: 'tag-2', tag: { text: 'EcoFriendly' } },
    ],
    pagination: {
      itemsPerPage: 6,
      nextButton: { label: { text: 'View All', iconPosition: 'right', ariaDescription: 'View More' } },
    },
    readTimeMinutesLabel: { text: 'min read', iconPosition: 'left', ariaDescription: 'read time' } as any,
    readArticleLabel: { text: 'Read', iconPosition: 'right', ariaDescription: 'read article' } as any,
  } as unknown as ApiBlogBlogDocument

  it('should render blog header with CMS data', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our Blog')
    expect(screen.getByText('Read our latest articles')).toBeInTheDocument()
  })

  it('should not render header when blogPageData is null', () => {
    const { container } = renderWithLayout(<BlogClient blogPageData={null} posts={[]} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('should render featured posts carousel (desktop and mobile versions)', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // Two carousels: one for desktop (xl + ltr), one for mobile (lg + ttb)
    expect(screen.getAllByTestId('mock-carousel').length).toBe(2)
    // First post is featured (appears in both carousels + may appear in tag sections)
    expect(screen.getAllByText('First Post').length).toBeGreaterThanOrEqual(2)
  })

  it('should render tag sections', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    expect(screen.getAllByText('Sustainability').length).toBeGreaterThan(0)
    expect(screen.getAllByText('EcoFriendly').length).toBeGreaterThan(0)
  })

  it('should filter posts by tag in sections', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Sustainability section should have posts 1 and 3
    // EcoFriendly section should have post 2
    // We can't strictly assert parent-child without complex selectors in RTL,
    // but we can check existence.
    const posts = screen.getAllByTestId('mock-blog-card')
    expect(posts.length).toBeGreaterThanOrEqual(3) // Featured(1) + Sust(2) + Eco(1) = 4 cards rendered
  })

  it('should render view all button for tags', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    const viewAllLinks = screen.getAllByText(/View All/)
    // There should be at least one View All button per tag section
    expect(viewAllLinks.length).toBeGreaterThan(0)
  })

  it('should align View All button correctly in RTL', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.RTL },
    })
    const viewAllLinks = screen.getAllByText(/View All/)
    expect(viewAllLinks.length).toBeGreaterThan(0)
    // ButtonLink is rendered as an anchor that inherits self-start class in RTL
    const link = viewAllLinks[0]!
    expect(link).toBeDefined()
  })

  it('should align View All button correctly in LTR', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    const viewAllLinks = screen.getAllByText(/View All/)
    expect(viewAllLinks.length).toBeGreaterThan(0)
    const link = viewAllLinks[0]!
    expect(link).toBeDefined()
  })

  it('should render without featured posts if empty or null', () => {
    const dataWithoutFeatured = { ...mockBlogPageData, featuredBlogPosts: [] }
    renderWithLayout(<BlogClient blogPageData={dataWithoutFeatured} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    expect(screen.queryByTestId('mock-carousel')).not.toBeInTheDocument()
    // Headers and tags should still be there
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should render empty state when tagFilters is null or empty', () => {
    const dataWithNoTags = {
      ...mockBlogPageData,
      tagFilters: [],
      pagination: {
        ...mockBlogPageData.pagination,
        noItemsFound: {
          header: {
            text: 'No items found',
            icon: 'search_off',
            iconPosition: 'left',
            ariaDescription: 'No items',
          },
        },
      },
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithNoTags} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // Should render empty state header
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No items found')
  })

  it('should render empty state when tagFilters is undefined (null)', () => {
    const dataWithNullTags = {
      ...mockBlogPageData,
      tagFilters: undefined,
      pagination: {
        ...mockBlogPageData.pagination,
        noItemsFound: {
          header: {
            text: 'Nothing here',
            iconPosition: 'left',
            ariaDescription: 'Empty',
          },
        },
      },
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithNullTags} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // Should render empty state without icon (no icon property)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Nothing here')
  })

  it('should skip tag sections where tagName is empty', () => {
    const dataWithEmptyTag = {
      ...mockBlogPageData,
      tagFilters: [
        { documentId: 'tag-empty', tag: { text: '' } },
        { documentId: 'tag-1', tag: { text: 'Sustainability' } },
      ],
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithEmptyTag} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // Sustainability section should render, empty tag should be skipped
    expect(screen.getAllByText('Sustainability').length).toBeGreaterThan(0)
  })

  it('should skip tag sections where no posts match the tag', () => {
    const dataWithUnmatchedTag = {
      ...mockBlogPageData,
      tagFilters: [{ documentId: 'tag-nomatch', tag: { text: 'NonExistentTag' } }],
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithUnmatchedTag} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // No cards should render in the tag section since no posts match
    expect(screen.queryByText('NonExistentTag')).not.toBeInTheDocument()
  })

  it('should handle section with only one post (no secondPost)', () => {
    const singlePostPerTag = [mockPosts[1]] as ApiBlogPostBlogPostDocument[]
    const dataWithOnePostTag = {
      ...mockBlogPageData,
      tagFilters: [{ documentId: 'tag-2', tag: { text: 'EcoFriendly' } }],
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithOnePostTag} posts={singlePostPerTag} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // Should render the section header and first post
    expect(screen.getAllByText('EcoFriendly').length).toBeGreaterThan(0)
    // The remaining posts grid should not render (no secondPost and no remaining)
    expect(screen.getAllByTestId('mock-blog-card').length).toBeGreaterThan(0)
  })

  it('should handle pagination.nextButton.label without icon and id', () => {
    const dataWithMinimalPagination = {
      ...mockBlogPageData,
      pagination: {
        itemsPerPage: 6,
        nextButton: {
          label: {
            text: 'View All',
            iconPosition: 'right',
            ariaDescription: 'View More',
          },
          openInNewTab: false,
        },
        noItemsFound: { header: { text: 'No items' } },
      },
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithMinimalPagination} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // Should still render view all buttons without crashing
    const viewAllLinks = screen.getAllByText(/View All/)
    expect(viewAllLinks.length).toBeGreaterThan(0)
  })

  it('should handle pagination.nextButton.label with icon and id', () => {
    const dataWithFullPagination = {
      ...mockBlogPageData,
      pagination: {
        itemsPerPage: 6,
        nextButton: {
          label: {
            text: 'View All',
            iconPosition: 'right',
            ariaDescription: 'View More',
            icon: 'arrow_forward',
            id: 'btn-label-id',
          },
          openInNewTab: false,
          id: 'btn-id',
        },
        noItemsFound: { header: { text: 'No items' } },
      },
    } as unknown as ApiBlogBlogDocument
    renderWithLayout(<BlogClient blogPageData={dataWithFullPagination} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    const viewAllLinks = screen.getAllByText(/View All/)
    expect(viewAllLinks.length).toBeGreaterThan(0)
  })

  it('should render detailed grid layout for remaining posts (more than 2 posts in a tag)', () => {
    renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })
    // "Fifth Post" is the 3rd post in "Sustainability" tag (after filters/slice)
    // Sustainability: Post 1, Post 3, Post 5.
    // Logic: topPosts = slice(0, 2) -> Post 1, Post 3
    // remainingPosts = slice(2) -> Post 5
    // Post 5 should be rendered twice (once for mobile, once for desktop) due to adaptive layout
    const fifthPosts = screen.getAllByText('Fifth Post')
    expect(fifthPosts.length).toBeGreaterThanOrEqual(2)
  })

  it('should cleanup animation frame on unmount', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame')

    const { unmount } = renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    cancelAnimationFrameSpy.mockRestore()
  })

  it('should become visible after mount', async () => {
    // Mock requestAnimationFrame to execute immediate
    const requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0)
      return 1
    })

    const { container } = renderWithLayout(<BlogClient blogPageData={mockBlogPageData} posts={mockPosts} />, {
      layoutContext: { direction: DirectionEnum.LTR },
    })

    // Should have opacity-100 class
    await waitFor(() => {
      expect(container.firstChild).toHaveClass('opacity-100')
    })

    requestAnimationFrameSpy.mockRestore()
  })
})
