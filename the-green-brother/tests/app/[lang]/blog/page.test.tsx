// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog page server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the client module
jest.mock('@/lib/content', () => ({
  getBlog: jest.fn(),
  getBlogPosts: jest.fn(),
  getNavigation: jest.fn(),
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

import BlogPage, { generateMetadata } from '@/app/[lang]/blog/page'
import { getBlog, getBlogPosts, getNavigation } from '@/lib/content'
import { LanguageCode, DirectionEnum, SchemaEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetBlog = getBlog as jest.MockedFunction<typeof getBlog>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>

describe('BlogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
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

    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.EN, {})
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

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const mockBlogData = { header: { header: { text: 'Blog' } } }
    const mockPosts = { data: [], meta: {} }

    mockGetBlog.mockResolvedValue(mockBlogData as Awaited<ReturnType<typeof getBlog>>)
    mockGetBlogPosts.mockResolvedValue(mockPosts as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await BlogPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
    expect(mockGetBlogPosts).toHaveBeenCalledWith({
      pagination: { page: 1, pageSize: 100 },
      locale: LanguageCode.EN,
      status: SchemaEnum.DRAFT,
    })
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS data', async () => {
    mockGetBlog.mockResolvedValue({
      seoMetadata: { metaTitle: 'Blog', metaDescription: 'Read our blog' },
    } as any)
    mockGetNavigation.mockResolvedValue({ siteTitle: 'TestSite' } as any)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBe('Blog')
    expect(metadata.description).toBe('Read our blog')
    expect(metadata.alternates?.canonical).toContain('/en/blog')
  })

  it('should handle null CMS data gracefully', async () => {
    mockGetBlog.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.alternates?.canonical).toContain('/en/blog')
  })
})
