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
    throw new Error('NEXT_NOT_FOUND')
  },
}))

// Mock JsonLdScript component
jest.mock('@/components/seo', () => ({
  JsonLdScript: jest.fn(({ data }: { data: Record<string, unknown> }) => (
    <script type="application/ld+json" data-testid="json-ld">
      {JSON.stringify(data)}
    </script>
  )),
}))

// Mock the BlogPostClient component
jest.mock('@/app/[lang]/blog/[slug]/BlogPostClient', () => ({
  __esModule: true,
  default: function MockBlogPostClient({ post }: { post: unknown }) {
    return <div data-testid="blog-post-client" data-has-post={post ? 'true' : 'false'} />
  },
}))

import BlogPostPage, { generateMetadata, generateStaticParams } from '@/app/[lang]/blog/[slug]/page'
import { JsonLdScript } from '@/components/seo'
import { getBlogPostBySlug, getBlogPosts, getNavigation } from '@/lib/content'
import { DirectionEnum, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages'
import { render, screen } from '@testing-library/react'

const mockGetBlogPostBySlug = getBlogPostBySlug as jest.MockedFunction<typeof getBlogPostBySlug>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>
const mockJsonLdScript = JsonLdScript as unknown as jest.Mock

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
    // Default getBlog mock - individual tests override as needed
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue({ id: 1 } as any)
  })

  it('should fetch blog post and pass to BlogPostClient', async () => {
    const mockPost = {
      documentId: 'post-1',
      slug: 'post-slug',
      content: { header: {} },
      author: { firstName: 'Jane', lastName: 'Doe' },
      wideImage: { url: 'https://example.com/featured.jpg' },
      squareImage: { url: 'https://example.com/featured-square.jpg' },
      publishedDate: '2026-01-15T10:00:00Z',
      updatedAt: '2026-02-20T14:30:00Z',
      seoMetadata: { metaTitle: 'Post Title', metaDescription: 'A post' },
    }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    render(Component)

    expect(mockGetBlogPostBySlug).toHaveBeenCalledWith('post-slug', { locale: LanguageCode.EN })
    expect(mockGetLanguages).toHaveBeenCalled()
    expect(mockGetNavigation).toHaveBeenCalledWith(LanguageCode.EN)
    expect(screen.getByTestId('blog-post-client')).toBeInTheDocument()
  })

  it('should render JSON-LD structured data for Article and Breadcrumb', async () => {
    const mockPost = {
      documentId: 'post-1',
      slug: 'post-slug',
      content: { header: {} },
      author: { firstName: 'Jane', lastName: 'Doe' },
      wideImage: { url: 'https://example.com/featured.jpg' },
      squareImage: { url: 'https://example.com/featured-square.jpg' },
      publishedDate: '2026-01-15T10:00:00Z',
      updatedAt: '2026-02-20T14:30:00Z',
      seoMetadata: { metaTitle: 'My Article', metaDescription: 'About eco products' },
    }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue({ id: 1 } as any)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    render(Component)

    // Should render two JsonLdScript components (Article + Breadcrumb)
    expect(mockJsonLdScript).toHaveBeenCalledTimes(2)
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'Article', headline: 'My Article' }),
      }),
      undefined
    )
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'BreadcrumbList' }),
      }),
      undefined
    )
  })

  it('should render JSON-LD with fallback title to slug and handling no author last name', async () => {
    const mockPost = {
      documentId: 'post-1',
      slug: 'fallback-slug',
      content: { header: {} },
      author: { firstName: 'Jane' }, // no lastName
      wideImage: { url: 'https://example.com/featured.jpg' },
      squareImage: { url: 'https://example.com/featured-square.jpg' },
      publishedDate: '2026-01-15T10:00:00Z',
      seoMetadata: { metaDescription: 'Testing fallback' }, // no metaTitle
    }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue({ id: 1 } as any)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'fallback-slug' }) })
    render(Component)

    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          '@type': 'Article',
          headline: 'fallback-slug',
          author: expect.objectContaining({ name: 'Jane' }),
        }),
      }),
      undefined
    )
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'BreadcrumbList' }), // will test the name inside structure if possible but at least it hits line 94
      }),
      undefined
    )
  })

  it('should call notFound when post is null', async () => {
    mockGetBlogPostBySlug.mockResolvedValue(null)

    await expect(
      BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'non-existent' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when navigation is null', async () => {
    const mockPost = {
      documentId: 'post-1',
      slug: 'post-slug',
      content: { header: {} },
      author: { firstName: 'Jane' },
      wideImage: { url: 'https://example.com/img.jpg' },
      squareImage: { url: 'https://example.com/img-square.jpg' },
      publishedDate: '2026-01-15',
      seoMetadata: { metaTitle: 'Post' },
    }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue(null)

    await expect(
      BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when blogData is null', async () => {
    const mockPost = {
      documentId: 'post-1',
      slug: 'post-slug',
      content: { header: {} },
      author: { firstName: 'Jane' },
      wideImage: { url: 'https://example.com/img.jpg' },
      squareImage: { url: 'https://example.com/img-square.jpg' },
      publishedDate: '2026-01-15',
      seoMetadata: { metaTitle: 'Post' },
    }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue(mockNavigation as any)

    // getBlog is mocked via @/lib/content, need to set it to return null
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue(null)

    await expect(
      BlogPostPage({ params: Promise.resolve({ lang: LanguageCode.EN, slug: 'post-slug' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should use default LTR direction when language is not found', async () => {
    const mockPost = {
      documentId: 'post-1',
      slug: 'post-slug',
      content: { header: {} },
      author: { firstName: 'Jane' },
      wideImage: { url: 'https://example.com/img.jpg' },
      squareImage: { url: 'https://example.com/img-square.jpg' },
      publishedDate: '2026-01-15',
      seoMetadata: { metaTitle: 'Post' },
    }
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

    const mockPost = {
      documentId: 'post-1',
      slug: 'post-slug',
      content: { header: {} },
      author: { firstName: 'Jane' },
      wideImage: { url: 'https://example.com/img.jpg' },
      squareImage: { url: 'https://example.com/img-square.jpg' },
      publishedDate: '2026-01-15',
      seoMetadata: { metaTitle: 'Post' },
    }
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
      wideImage: { url: 'https://example.com/featured.jpg' },
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
