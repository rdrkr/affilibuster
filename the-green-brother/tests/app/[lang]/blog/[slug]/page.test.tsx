// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog post detail page server component
 */

// Mock the client module
jest.mock('@/lib/content', () => ({
  __esModule: true,
  getBlogPostBySlug: jest.fn(),
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

import BlogPostPage from '@/app/[lang]/blog/[slug]/page'
import { getBlogPostBySlug, getNavigation } from '@/lib/content'
import { CodeEnum, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages'
import { render, screen } from '@testing-library/react'

const mockGetBlogPostBySlug = getBlogPostBySlug as jest.MockedFunction<typeof getBlogPostBySlug>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('BlogPostPage', () => {
  const mockLanguages = [
    {
      code: CodeEnum.EN,
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
      code: CodeEnum.IT,
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
    mockGetLanguages.mockResolvedValue(mockLanguages as any)
    mockGetNavigation.mockResolvedValue(mockNavigation as any)
  })

  it('should fetch blog post and pass to BlogPostClient', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'post-slug' }) })
    render(Component)

    expect(mockGetBlogPostBySlug).toHaveBeenCalledWith('post-slug', { locale: CodeEnum.EN })
    expect(mockGetLanguages).toHaveBeenCalled()
    expect(mockGetNavigation).toHaveBeenCalledWith(CodeEnum.EN)
    expect(screen.getByTestId('blog-post-client')).toBeInTheDocument()
  })

  it('should call notFound when post is null', async () => {
    mockGetBlogPostBySlug.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'non-existent' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when navigation is null', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'post-slug' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should call notFound when blogData is null', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetNavigation.mockResolvedValue(mockNavigation as any)

    // getBlog is mocked via @/lib/content, need to set it to return null
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'post-slug' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should use default LTR direction when language is not found', async () => {
    const mockPost = { documentId: 'post-1', slug: 'post-slug', content: { header: {} } }
    mockGetBlogPostBySlug.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostBySlug>>)
    mockGetLanguages.mockResolvedValue([] as any) // No languages found
    const { getBlog } = require('@/lib/content') as { getBlog: jest.Mock }
    getBlog.mockResolvedValue({ id: 1 } as any)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, slug: 'post-slug' }) })
    render(Component)

    expect(screen.getByTestId('blog-post-client')).toBeInTheDocument()
  })
})
