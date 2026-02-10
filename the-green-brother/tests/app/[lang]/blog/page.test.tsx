// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  getBlog: jest.fn(),
  getBlogPosts: jest.fn(),
}))

jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock the BlogClient component
jest.mock('@/app/[lang]/blog/BlogClient', () => ({
  __esModule: true,
  default: function MockBlogClient(props: {
    blogPageData: unknown
    posts: unknown[]
    lang: LanguageCode
    direction: DirectionEnum
  }) {
    return (
      <div
        data-testid="blog-client"
        data-lang={props.lang}
        data-direction={props.direction}
        data-post-count={Array.isArray(props.posts) ? props.posts.length : 0}
      />
    )
  },
}))

import BlogPage from '@/app/[lang]/blog/page'
import { getBlog, getBlogPosts } from '@/lib/content'
import { LanguageCode, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetBlog = getBlog as jest.MockedFunction<typeof getBlog>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>

describe('BlogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetLanguages.mockResolvedValue([
      { code: LanguageCode.EN, direction: DirectionEnum.LTR },
      { code: LanguageCode.IT, direction: DirectionEnum.LTR },
    ] as unknown as Awaited<ReturnType<typeof getLanguages>>)
  })

  it('should fetch blog data and pass to BlogClient', async () => {
    const mockBlogData = { header: { header: { text: 'Blog' } } }
    const mockPosts = { data: [{ id: 1 }, { id: 2 }], meta: {} }

    mockGetBlog.mockResolvedValue(mockBlogData as Awaited<ReturnType<typeof getBlog>>)
    mockGetBlogPosts.mockResolvedValue(mockPosts as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await BlogPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.EN)
    expect(mockGetBlogPosts).toHaveBeenCalledWith({
      pagination: { page: 1, pageSize: 100 },
      locale: LanguageCode.EN,
    })
    expect(screen.getByTestId('blog-client')).toBeInTheDocument()
    expect(screen.getByTestId('blog-client').getAttribute('data-post-count')).toBe('2')
  })

  it('should pass empty array when posts response is null', async () => {
    mockGetBlog.mockResolvedValue(null)
    mockGetBlogPosts.mockResolvedValue(null)

    const Component = await BlogPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(screen.getByTestId('blog-client').getAttribute('data-post-count')).toBe('0')
  })
})
