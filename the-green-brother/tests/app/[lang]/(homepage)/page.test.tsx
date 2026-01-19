// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for homepage server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
  getHomepage: jest.fn(),
  getProducts: jest.fn(),
  getProductCategories: jest.fn(),
  getBlogPosts: jest.fn(),
  getContributors: jest.fn(),
  getBlog: jest.fn(),
}))

// Mock feature flags to avoid jose ESM import issues
jest.mock('@/lib/feature-flags', () => ({
  userProfileFlag: jest.fn().mockResolvedValue(false),
}))

// Mock the HomeClient component
jest.mock('@/app/[lang]/(homepage)/HomeClient', () => ({
  __esModule: true,
  default: function MockHomeClient({ children }: { children: React.ReactNode }) {
    return <div data-testid="home-client">{children}</div>
  },
}))

// Mock HomeSections component
// Mock HomeSections component
jest.mock('@/components/homepage', () => ({
  HomeSections: jest.fn(() => <div data-testid="home-sections" />),
}))

import HomePage from '@/app/[lang]/(homepage)/page'
import { HomeSections } from '@/components/homepage'
import { getBlog, getBlogPosts, getContributors, getHomepage, getProductCategories, getProducts } from '@/lib/client'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetHomepage = getHomepage as jest.MockedFunction<typeof getHomepage>
const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetProductCategories = getProductCategories as jest.MockedFunction<typeof getProductCategories>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetContributors = getContributors as jest.MockedFunction<typeof getContributors>
const mockGetBlog = getBlog as jest.MockedFunction<typeof getBlog>
const mockHomeSections = HomeSections as unknown as jest.Mock

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data and pass to HomeSections', async () => {
    const mockHomepageData = { sections: [] }
    const mockProducts = { data: [{ id: 1 }], meta: {} }
    const mockCategories = { data: [{ id: 1 }], meta: {} }
    const mockBlogPosts = { data: [{ id: 1 }], meta: {} }
    // getContributors returns just the data array (response.data), not the full response
    const mockContributorsData = [{ id: 1 }]
    const mockBlogPage = {
      defaultContributor: { id: 1, name: 'Default' },
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue(mockProducts as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue(
      mockCategories as unknown as Awaited<ReturnType<typeof getProductCategories>>
    )
    mockGetBlogPosts.mockResolvedValue(mockBlogPosts as unknown as Awaited<ReturnType<typeof getBlogPosts>>)
    mockGetContributors.mockResolvedValue(
      mockContributorsData as unknown as Awaited<ReturnType<typeof getContributors>>
    )
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetProducts).toHaveBeenCalledWith({
      pagination: { page: 1, pageSize: 100 },
      locale: CodeEnum.EN,
    })
    expect(mockGetContributors).toHaveBeenCalled()
    expect(screen.getByTestId('home-client')).toBeInTheDocument()
    expect(screen.getByTestId('home-sections')).toBeInTheDocument()
    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: mockHomepageData.sections,
        products: mockProducts.data,
        categories: mockCategories.data,
        blogPosts: mockBlogPosts.data,
        contributors: mockContributorsData,
      }),
      undefined
    )
  })

  it('should pass empty arrays when other responses are null', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue(null)
    mockGetProductCategories.mockResolvedValue(null)
    mockGetBlogPosts.mockResolvedValue(null)
    mockGetContributors.mockResolvedValue(null)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [],
        products: [],
        categories: [],
        blogPosts: [],
        contributors: [],
      }),
      undefined
    )
  })

  it('should return null if homepage data is missing', async () => {
    mockGetHomepage.mockResolvedValue(null)
    mockGetProducts.mockResolvedValue({ data: [] } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [] } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [] } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)
    // getContributors returns just the data array, not {data: [], meta: {}}
    mockGetContributors.mockResolvedValue([] as unknown as Awaited<ReturnType<typeof getContributors>>)

    const result = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })

    expect(result).toBeNull()
  })

  it('should work with Italian locale', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)
    // getContributors returns just the data array, not {data: [], meta: {}}
    mockGetContributors.mockResolvedValue([] as unknown as Awaited<ReturnType<typeof getContributors>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.IT }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(CodeEnum.IT)
  })

  it('should fetch contributors with author role filter and pass to HomeSections', async () => {
    // getContributors returns just the data array (already filtered server-side by roleId=author)
    const mockAuthors = [
      { id: 1, name: 'Author 1', roles: [{ roleId: 'author' }] },
      { id: 2, name: 'Author 2', roles: [{ roleId: 'author' }] },
    ]

    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue({ data: [] } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [] } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [] } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)
    mockGetContributors.mockResolvedValue(mockAuthors as unknown as Awaited<ReturnType<typeof getContributors>>)
    mockGetBlog.mockResolvedValue({
      defaultContributor: { id: 1 },
      readTimeMinutesLabel: {},
      readArticleLabel: {},
    } as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    // Verify getContributors was called with author role filter
    expect(mockGetContributors).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { roles: { roleId: { $ei: 'author' } } },
      })
    )

    // Verify authors are passed to HomeSections as contributors
    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        contributors: mockAuthors,
      }),
      undefined
    )
  })
})
