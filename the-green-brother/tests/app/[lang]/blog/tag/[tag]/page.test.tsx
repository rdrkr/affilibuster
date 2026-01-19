// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TopicPage (tag detail page)
 */

import { render, screen } from '@testing-library/react'

import { CodeEnum } from '@/lib/generated/types.gen'

// Mock API functions
jest.mock('@/lib/client', () => ({
  getBlog: jest.fn(),
  getBlogPosts: jest.fn(),
}))

// Mock TopicClient
jest.mock('@/app/[lang]/blog/tag/[tag]/TopicClient', () => {
  return {
    __esModule: true,
    default: function MockTopicClient({ tag, posts }: { tag: string; posts: { documentId: string }[] }) {
      return (
        <div data-testid="mock-topic-client">
          <span data-testid="tag">{tag}</span>
          <span data-testid="posts-count">{posts.length}</span>
        </div>
      )
    },
  }
})

import TopicPage from '@/app/[lang]/blog/tag/[tag]/page'
import { getBlog, getBlogPosts } from '@/lib/client'

const mockGetBlogPosts = getBlogPosts as jest.Mock
const mockGetBlog = getBlog as jest.Mock

describe('TopicPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render TopicClient with fetched data', async () => {
    const mockPosts = [
      { documentId: 'post-1', slug: 'test-post' },
      { documentId: 'post-2', slug: 'test-post-2' },
    ]

    mockGetBlogPosts.mockResolvedValue({ data: mockPosts })
    mockGetBlog.mockResolvedValue({
      pagination: { noItemsFound: { header: { text: 'No items' } } },
      defaultContributor: { id: 1, name: 'Default' },
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    })

    const Component = await TopicPage({ params: Promise.resolve({ lang: CodeEnum.EN, tag: 'TestTag' }) })
    render(Component)

    expect(screen.getByTestId('mock-topic-client')).toBeInTheDocument()
    expect(screen.getByTestId('tag')).toHaveTextContent('TestTag')
    expect(screen.getByTestId('posts-count')).toHaveTextContent('2')
  })

  it('should decode URL-encoded tag', async () => {
    mockGetBlogPosts.mockResolvedValue({ data: [] })
    mockGetBlog.mockResolvedValue({
      pagination: {},
      defaultContributor: { id: 1, name: 'Default' },
    })

    const Component = await TopicPage({
      params: Promise.resolve({ lang: CodeEnum.EN, tag: 'Eco%20Friendly' }),
    })
    render(Component)

    expect(screen.getByTestId('tag')).toHaveTextContent('Eco Friendly')
  })

  it('should handle empty posts response', async () => {
    mockGetBlogPosts.mockResolvedValue(null)
    mockGetBlog.mockResolvedValue({
      pagination: {},
      defaultContributor: { id: 1, name: 'Default' },
    })

    const Component = await TopicPage({ params: Promise.resolve({ lang: CodeEnum.EN, tag: 'Test' }) })
    render(Component)

    expect(screen.getByTestId('posts-count')).toHaveTextContent('0')
  })
})
