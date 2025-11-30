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
}))

// Mock the languages API
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock the HomeClient component
jest.mock('@/app/[lang]/(homepage)/HomeClient', () => ({
  __esModule: true,
  default: function MockHomeClient(props: Record<string, unknown>) {
    return <div data-testid="home-client" data-props={JSON.stringify(props)} />
  },
}))

import HomePage from '@/app/[lang]/(homepage)/page'
import { getBlogPosts, getHomepage, getProductCategories, getProducts } from '@/lib/client'
import { CodeEnum, CurrencyCode, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetHomepage = getHomepage as jest.MockedFunction<typeof getHomepage>
const mockGetProducts = getProducts as jest.MockedFunction<typeof getProducts>
const mockGetProductCategories = getProductCategories as jest.MockedFunction<typeof getProductCategories>
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<typeof getBlogPosts>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default languages mock with all required Language properties
    mockGetLanguages.mockResolvedValue([
      {
        code: CodeEnum.EN,
        direction: DirectionEnum.LTR,
        flag: '🇺🇸',
        displayName: 'English',
        nativeName: 'English',
        urlPrefix: 'en',
        defaultCurrency: CurrencyCode.USD,
        localeCode: 'en-US',
        isDefault: true,
      },
      {
        code: CodeEnum.IT,
        direction: DirectionEnum.LTR,
        flag: '🇮🇹',
        displayName: 'Italiano',
        nativeName: 'Italiano',
        urlPrefix: 'it',
        defaultCurrency: CurrencyCode.EUR,
        localeCode: 'it-IT',
        isDefault: false,
      },
      {
        code: CodeEnum.HE,
        direction: DirectionEnum.RTL,
        flag: '🇮🇱',
        displayName: 'עברית',
        nativeName: 'עברית',
        urlPrefix: 'he',
        defaultCurrency: CurrencyCode.ILS,
        localeCode: 'he-IL',
        isDefault: false,
      },
    ])
  })

  it('should fetch data and pass to HomeClient', async () => {
    const mockHomepageData = { sections: [] }
    const mockProducts = { data: [{ id: 1 }], meta: {} }
    const mockCategories = { data: [{ id: 1 }], meta: {} }
    const mockBlogPosts = { data: [{ id: 1 }], meta: {} }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue(mockProducts as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue(
      mockCategories as unknown as Awaited<ReturnType<typeof getProductCategories>>
    )
    mockGetBlogPosts.mockResolvedValue(mockBlogPosts as unknown as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetProducts).toHaveBeenCalledWith({
      pagination: { page: 1, pageSize: 4 },
      locale: CodeEnum.EN,
    })
    expect(mockGetLanguages).toHaveBeenCalled()
    expect(screen.getByTestId('home-client')).toBeInTheDocument()
  })

  it('should pass empty arrays when responses are null', async () => {
    mockGetHomepage.mockResolvedValue(null)
    mockGetProducts.mockResolvedValue(null)
    mockGetProductCategories.mockResolvedValue(null)
    mockGetBlogPosts.mockResolvedValue(null)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    const homeClient = screen.getByTestId('home-client')
    const props = JSON.parse(homeClient.getAttribute('data-props') ?? '{}')
    expect(props.products).toEqual([])
    expect(props.categories).toEqual([])
    expect(props.blogPosts).toEqual([])
  })

  it('should work with Italian locale', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.IT }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(CodeEnum.IT)
  })

  it('should pass LTR direction for English locale', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    const homeClient = screen.getByTestId('home-client')
    const props = JSON.parse(homeClient.getAttribute('data-props') ?? '{}')
    expect(props.direction).toBe(DirectionEnum.LTR)
  })

  it('should pass RTL direction for Hebrew locale', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.HE }) })
    render(Component)

    const homeClient = screen.getByTestId('home-client')
    const props = JSON.parse(homeClient.getAttribute('data-props') ?? '{}')
    expect(props.direction).toBe(DirectionEnum.RTL)
  })

  it('should default to LTR when languages API returns null', async () => {
    mockGetLanguages.mockResolvedValue(null)
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetProducts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getProducts>>)
    mockGetProductCategories.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<
      ReturnType<typeof getProductCategories>
    >)
    mockGetBlogPosts.mockResolvedValue({ data: [], meta: {} } as unknown as Awaited<ReturnType<typeof getBlogPosts>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    const homeClient = screen.getByTestId('home-client')
    const props = JSON.parse(homeClient.getAttribute('data-props') ?? '{}')
    expect(props.direction).toBe(DirectionEnum.LTR)
  })
})
