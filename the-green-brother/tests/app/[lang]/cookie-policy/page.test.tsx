// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for CookiePolicyPage server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the client module
jest.mock('@/lib/content', () => ({
  getCookiePolicy: jest.fn(),
  getNavigation: jest.fn(),
}))

// Mock CookiePolicyClient
jest.mock('@/app/[lang]/cookie-policy/CookiePolicyClient', () => {
  return function MockCookiePolicyClient({ data }: { data: unknown }) {
    return (
      <div data-testid="cookie-policy-client" data-has-data={!!data}>
        CookiePolicyClient
      </div>
    )
  }
})

import { render, screen } from '@testing-library/react'

import CookiePolicyPage, { generateMetadata } from '@/app/[lang]/cookie-policy/page'
import { getCookiePolicy, getNavigation } from '@/lib/content'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'

const mockGetCookiePolicy = getCookiePolicy as jest.MockedFunction<typeof getCookiePolicy>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('CookiePolicyPage', () => {
  const mockCookiePolicyData = {
    documentId: 'cookie-policy-1',
    id: 1,
    publishedAt: '2025-01-01',
    content: {
      id: 1,
      content: '# Cookie Policy',
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    mockGetCookiePolicy.mockResolvedValue(mockCookiePolicyData)
  })

  it('should fetch data and render client component', async () => {
    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await CookiePolicyPage({ params })
    render(ui)

    expect(mockGetCookiePolicy).toHaveBeenCalledWith(LanguageCode.EN, {})

    const client = screen.getByTestId('cookie-policy-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-data', 'true')
  })

  it('should handle null data', async () => {
    mockGetCookiePolicy.mockResolvedValue(null)

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await CookiePolicyPage({ params })
    render(ui)

    expect(mockGetCookiePolicy).toHaveBeenCalledWith(LanguageCode.EN, {})

    const client = screen.getByTestId('cookie-policy-client')
    expect(client).toHaveAttribute('data-has-data', 'false')
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await CookiePolicyPage({ params })
    render(ui)

    expect(mockGetCookiePolicy).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS data', async () => {
    mockGetCookiePolicy.mockResolvedValue({
      seoMetadata: { metaTitle: 'Cookie Policy', metaDescription: 'Our cookie policy' },
    } as any)
    mockGetNavigation.mockResolvedValue({ siteTitle: 'TestSite' } as any)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBe('Cookie Policy')
    expect(metadata.description).toBe('Our cookie policy')
    expect(metadata.alternates?.canonical).toContain('/en/cookie-policy')
  })

  it('should handle null CMS data gracefully', async () => {
    mockGetCookiePolicy.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.alternates?.canonical).toContain('/en/cookie-policy')
  })
})
