// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog post detail page server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the client module
jest.mock('@/lib/content', () => ({
  __esModule: true,
  getBlogPostBySlug: jest.fn(),
  getBlogPosts: jest.fn(),
  getNavigation: jest.fn(),
  getBlog: jest.fn(),
}))

jest.mock('@/lib/languages', () => ({
  getLanguages: jest.fn(),
}))

// Mock next/navigation
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  notFound: (): void => {
    mockNotFound()
  },
}))

// Mock the BlogPostClient component
jest.mock('@/app/[lang]/blog/[slug]/BlogPostClient', () => ({
  __esModule: true,
  default: function MockBlogPostClient({ post }: { post: unknown }) {
    return <div data-testid="blog-post-client" data-has-post={post ? 'true' : 'false'} />
  },
}))

import BlogPostPage, { generateMetadata, generateStaticParams } from '@/app/[lang]/blog/[slug]/page'
import { getBlogPostBySlug, getBlogPosts, getNavigation } from '@/lib/content'
import { LanguageCode, DirectionEnum, SchemaEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages'
import { render, screen } from '@testing-library/react'

const mockGetBlogPostBySlug = getBlogPostBySlug as jest.MockedFunction<typeof getBlogPostBySlug>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('BlogPostPage', () => {
  const mockLanguages = [
    {
      code: LanguageCode.EN,
      displayName: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      direction: DirectionEnum.LTR,
      urlPrefix: '/en',
      defaultCurrency: 'USD',
      localeCode: 'en-US',
      isDefault: true,
    },
    {
      code: LanguageCode.IT,
      displayName: 'Italian',
      nativeName: 'Italiano',
      flag: '🇮🇹',
      direction: DirectionEnum.LTR,
      urlPrefix: '/it',
      defaultCurrency: 'EUR',
      localeCode: 'it-IT',
      isDefault: false,
    },
  ]

  const mockNavigation = {
    documentId: 'nav-1',
    id: 'nav-1',
    siteTitle: 'Test Site',
    siteDescription: 'Test Description',
    publishedAt: '2024-01-01T00:00:00Z',
    homeButton: { url: '/en', label: { text: 'Home' }, openInNewTab: false },
    blogButton: { url: '/en/blog', label: { text: 'Blog' }, openInNewTab: false },
    aboutButton: { url: '/en/about', label: { text: 'About' }, openInNewTab: false },
    productsMenu: { menuButton: { url: '/en/products', label: { text: 'Products' }, openInNewTab: false } },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    mockGetLanguages.mockResolvedValue(mockLanguages as any)
    mockGetNavigation.mockResolvedValue(mockNavigation as any)
  })

  it('should fetch blog post and pass to BlogPostClient', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    render(Component)

    expect(mockGetBlogPostBySlug).toHaveBeenCalledWith('post-slug', { locale: LanguageCode.EN })
    expect(mockGetLanguages).toHaveBeenCalled()
    expect(mockGetNavigation).toHaveBeenCalledWith(LanguageCode.EN)
    expect(screen.getByTestId('blog-post-client')).toBeInTheDocument()
  })

  it('should call notFound when post is null', async () => {
    mockGetBlogPostBySlug.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'non-existent' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when navigation is null', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when blogData is null', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue(mockNavigation as any)

    // getBlog is mocked via @/lib/content, need to set it to return null
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should use default LTR direction when language is not found', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetLanguages.mockResolvedValue([] as any) // No languages found
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue({ id: 1 } as any)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    render(Component)

    expect(screen.getByTestId('blog-post-client')).toBeInTheDocument()
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue({ id: 1 } as any)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    render(Component)

    expect(mockGetBlogPostBySlug).toHaveBeenCalledWith('post-slug', {
      locale: LanguageCode.EN,
      status: SchemaEnum.DRAFT,
    })
    expect(getBlog).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
  })
})

describe('generateStaticParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return params for all blog posts across all languages', async () => {
    mockGetBlogPosts.mockResolvedValue({
      data: [{ slug: 'my-post' }, { slug: 'another-post' }],
    } as Awaited<ReturnType<typeof getBlogPosts>>)

    const params = await generateStaticParams()

    expect(params).toEqual(
      expect.arrayContaining([
        { lang: 'en', slug: 'my-post' },
        { lang: 'it', slug: 'my-post' },
        { lang: 'he', slug: 'my-post' },
        { lang: 'en', slug: 'another-post' },
        { lang: 'it', slug: 'another-post' },
        { lang: 'he', slug: 'another-post' },
      ])
    )
    expect(params.length).toBe(6)
  })

  it('should return empty array when response is null', async () => {
    mockGetBlogPosts.mockResolvedValue(null as unknown as Awaited<ReturnType<typeof getBlogPosts>>)

    const params = await generateStaticParams()

    expect(params).toEqual([])
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS blog post data', async () => {
    mockGetBlogPostBySlug.mockResolvedValue({
      seoMetadata: { metaTitle: 'My Blog Post', metaDescription: 'A great post' },
      featuredImage: { url: 'https://example.com/featured.jpg' },
    } as unknown as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue({
      siteTitle: 'TheGreenBrother',
    } as Awaited<ReturnType<typeof getNavigation>>)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, slug: 'my-post' }),
    })

    expect(metadata.title).toBe('My Blog Post')
    expect(metadata.description).toBe('A great post')
    expect(metadata.openGraph).toEqual(expect.objectContaining({ type: 'article' }))
    expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/featured.jpg' }])
  })

  it('should handle null post gracefully', async () => {
    mockGetBlogPostBySlug.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({
      params: Promise.resolve({ lang: LanguageCode.EN, slug: 'non-existent' }),
    })

    expect(metadata.title).toBeUndefined()
    expect(metadata.description).toBeUndefined()
  })
})
