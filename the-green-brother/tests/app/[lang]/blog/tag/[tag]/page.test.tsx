// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TopicPage (tag detail page)
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock API functions
jest.mock('@/lib/content', () => ({
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

import { render, screen } from '@testing-library/react'

import TopicPage from '@/app/[lang]/blog/tag/[tag]/page'
import { getBlog, getBlogPosts } from '@/lib/content'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'

const mockGetBlogPosts = getBlogPosts as jest.Mock
const mockGetBlog = getBlog as jest.Mock

describe('TopicPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
  })

  it('should render TopicClient with fetched data', async () => {
    const mockPosts = [
      { documentId: 'post-1', slug: 'test-post' },
      { documentId: 'post-2', slug: 'test-post-2' },
    ]

    mockGetBlogPosts.mockResolvedValue({ data: mockPosts })
    mockGetBlog.mockResolvedValue({
      pagination: { noItemsFound: { header: { text: 'No items' } } },
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    })

    const Component = await TopicPage({ params: Promise.resolve({ lang: LanguageCode.EN, tag: 'TestTag' }) })
    render(Component)

    expect(screen.getByTestId('mock-topic-client')).toBeInTheDocument()
    expect(screen.getByTestId('tag')).toHaveTextContent('TestTag')
    expect(screen.getByTestId('posts-count')).toHaveTextContent('2')
  })

  it('should decode URL-encoded tag', async () => {
    mockGetBlogPosts.mockResolvedValue({ data: [] })
    mockGetBlog.mockResolvedValue({
      pagination: {},
    })

    const Component = await TopicPage({
      params: Promise.resolve({ lang: LanguageCode.EN, tag: 'Eco%20Friendly' }),
    })
    render(Component)

    expect(screen.getByTestId('tag')).toHaveTextContent('Eco Friendly')
  })

  it('should handle empty posts response', async () => {
    mockGetBlogPosts.mockResolvedValue(null)
    mockGetBlog.mockResolvedValue({
      pagination: {},
    })

    const Component = await TopicPage({ params: Promise.resolve({ lang: LanguageCode.EN, tag: 'Test' }) })
    render(Component)

    expect(screen.getByTestId('posts-count')).toHaveTextContent('0')
  })

  it('should return null when getBlog returns null', async () => {
    mockGetBlogPosts.mockResolvedValue({ data: [{ documentId: 'post-1' }] })
    mockGetBlog.mockResolvedValue(null)

    const Component = await TopicPage({ params: Promise.resolve({ lang: LanguageCode.EN, tag: 'Test' }) })

    expect(Component).toBeNull()
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    mockGetBlogPosts.mockResolvedValue({ data: [] })
    mockGetBlog.mockResolvedValue({
      pagination: { noItemsFound: { header: { text: 'No items' } } },
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    })

    const Component = await TopicPage({ params: Promise.resolve({ lang: LanguageCode.EN, tag: 'TestTag' }) })
    render(Component)

    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
    expect(mockGetBlogPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: LanguageCode.EN,
        status: SchemaEnum.DRAFT,
      })
    )
  })
})
