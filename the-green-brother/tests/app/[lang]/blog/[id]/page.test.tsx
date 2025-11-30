// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for blog post detail page server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
  getBlogPostById: jest.fn(),
}))

// Mock next/navigation
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  notFound: (): void => {
    mockNotFound()
  },
}))

// Mock the BlogPostClient component
jest.mock('@/app/[lang]/blog/[id]/BlogPostClient', () => ({
  __esModule: true,
  default: function MockBlogPostClient({ post, lang }: { post: unknown; lang: CodeEnum }) {
    return <div data-testid="blog-post-client" data-lang={lang} data-has-post={post ? 'true' : 'false'} />
  },
}))

import BlogPostPage from '@/app/[lang]/blog/[id]/page'
import { getBlogPostById } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetBlogPostById = getBlogPostById as jest.MockedFunction<typeof getBlogPostById>

describe('BlogPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch blog post and pass to BlogPostClient', async () => {
    const mockPost = { documentId: 'post-1', content: { header: {} } }
    mockGetBlogPostById.mockResolvedValue(mockPost as Awaited<ReturnType<typeof getBlogPostById>>)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, id: 'post-1' }) })
    render(Component)

    expect(mockGetBlogPostById).toHaveBeenCalledWith('post-1', { locale: CodeEnum.EN })
    expect(screen.getByTestId('blog-post-client')).toBeInTheDocument()
  })

  it('should call notFound when post is null', async () => {
    mockGetBlogPostById.mockResolvedValue(null)

    await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.EN, id: 'non-existent' }) })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should pass correct language to BlogPostClient', async () => {
    mockGetBlogPostById.mockResolvedValue({ documentId: 'post-1' } as Awaited<ReturnType<typeof getBlogPostById>>)

    const Component = await BlogPostPage({ params: Promise.resolve({ lang: CodeEnum.IT, id: 'post-1' }) })
    render(Component)

    expect(screen.getByTestId('blog-post-client').getAttribute('data-lang')).toBe(CodeEnum.IT)
  })
})
