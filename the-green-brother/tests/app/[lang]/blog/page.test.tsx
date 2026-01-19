// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog page server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
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
    lang: CodeEnum
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
import { getBlog, getBlogPosts } from '@/lib/client'
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetBlog = getBlog as jest.MockedFunction<typeof getBlog>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>

describe('BlogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetLanguages.mockResolvedValue([
      { code: CodeEnum.EN, direction: DirectionEnum.LTR },
      { code: CodeEnum.IT, direction: DirectionEnum.LTR },
    ] as unknown as Awaited<ReturnType<typeof getLanguages>>)
  })

  it('should fetch blog data and pass to BlogClient', async () => {
    const mockBlogData = { header: { header: { text: 'Blog' } } }
    const mockPosts = { data: [{ id: 1 }, { id: 2 }], meta: {} }

    mockGetBlog.mockResolvedValue(mockBlogData as Awaited<ReturnType<typeof getBlog>>)
    mockGetBlogPosts.mockResolvedValue(mockPosts as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await BlogPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetBlog).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetBlogPosts).toHaveBeenCalledWith({
      pagination: { page: 1, pageSize: 100 },
      locale: CodeEnum.EN,
    })
    expect(screen.getByTestId('blog-client')).toBeInTheDocument()
    expect(screen.getByTestId('blog-client').getAttribute('data-post-count')).toBe('2')
  })

  it('should pass empty array when posts response is null', async () => {
    mockGetBlog.mockResolvedValue(null)
    mockGetBlogPosts.mockResolvedValue(null)

    const Component = await BlogPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('blog-client').getAttribute('data-post-count')).toBe('0')
  })
})
