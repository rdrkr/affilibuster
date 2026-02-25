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
  getNavigation: jest.fn(),
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

import TopicPage, { generateMetadata, generateStaticParams } from '@/app/[lang]/blog/tag/[tag]/page'
import { getBlog, getBlogPosts, getNavigation } from '@/lib/content'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'

const mockGetBlogPosts = getBlogPosts as jest.Mock
const mockGetBlog = getBlog as jest.Mock
const mockGetNavigation = getNavigation as jest.Mock

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

describe('generateStaticParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return params for all unique tags across all languages', async () => {
    mockGetBlogPosts.mockResolvedValue({
      data: [{ tags: [{ tag: { text: 'Eco' } }, { tag: { text: 'Green' } }] }, { tags: [{ tag: { text: 'Eco' } }] }],
    })

    const params = await generateStaticParams()

    // 2 unique tags x 3 languages = 6 params
    expect(params.length).toBe(6)
    expect(params).toEqual(
      expect.arrayContaining([
        { lang: 'en', tag: encodeURIComponent('Eco') },
        { lang: 'it', tag: encodeURIComponent('Eco') },
        { lang: 'he', tag: encodeURIComponent('Eco') },
        { lang: 'en', tag: encodeURIComponent('Green') },
        { lang: 'it', tag: encodeURIComponent('Green') },
        { lang: 'he', tag: encodeURIComponent('Green') },
      ])
    )
  })

  it('should return empty array when response is null', async () => {
    mockGetBlogPosts.mockResolvedValue(null)

    const params = await generateStaticParams()

    expect(params).toEqual([])
  })

  it('should handle posts with empty tags array', async () => {
    mockGetBlogPosts.mockResolvedValue({
      data: [{ tags: [] }, { tags: [] }],
    })

    const params = await generateStaticParams()

    expect(params).toEqual([])
  })

  it('should skip tags with empty text', async () => {
    mockGetBlogPosts.mockResolvedValue({
      data: [{ tags: [{ tag: { text: 'Valid' } }, { tag: { text: '' } }] }],
    })

    const params = await generateStaticParams()

    expect(params.length).toBe(3) // 1 tag x 3 languages (empty string is falsy, skipped)
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata with tag prepended to blog title', async () => {
    mockGetBlog.mockResolvedValue({
      seoMetadata: { metaTitle: 'Our Blog', metaDescription: 'Blog description' },
    })
    mockGetNavigation.mockResolvedValue({
      siteTitle: 'TheGreenBrother',
    })

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, tag: 'Eco%20Friendly' }),
    })

    expect(metadata.title).toBe('Eco Friendly - Our Blog')
    expect(metadata.description).toBe('Blog description')
  })

  it('should use tag as title when blog data is null', async () => {
    mockGetBlog.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, tag: 'Eco' }),
    })

    expect(metadata.title).toBe('Eco')
  })

  it('should use tag as title when seoMetadata has no metaTitle', async () => {
    mockGetBlog.mockResolvedValue({
      seoMetadata: { metaDescription: 'Desc only' },
    })
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, tag: 'Green' }),
    })

    expect(metadata.title).toBe('Green')
  })
})
