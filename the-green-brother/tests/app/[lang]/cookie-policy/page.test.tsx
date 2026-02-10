// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for CookiePolicyPage server component
 */

import { render, screen } from '@testing-library/react'

import CookiePolicyPage from '@/app/[lang]/cookie-policy/page'
import { getCookiePolicy } from '@/lib/content'
import type { ApiCookiePolicyCookiePolicyDocument } from '@/lib/generated/types.gen'
import { LanguageCode } from '@/lib/generated/types.gen'

// Mock the client module
jest.mock('@/lib/content', () => ({
  getCookiePolicy: jest.fn(),
}))

const mockGetCookiePolicy = getCookiePolicy as jest.MockedFunction<typeof getCookiePolicy>

// Mock CookiePolicyClient
jest.mock('@/app/[lang]/cookie-policy/CookiePolicyClient', () => {
  return function MockCookiePolicyClient({ data }: { data: ApiCookiePolicyCookiePolicyDocument | null }) {
    return (
      <div data-testid="cookie-policy-client" data-has-data={!!data}>
        CookiePolicyClient
      </div>
    )
  }
})

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
    mockGetCookiePolicy.mockResolvedValue(mockCookiePolicyData)
  })

  it('should fetch data and render client component', async () => {
    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await CookiePolicyPage({ params })
    render(ui)

    expect(mockGetCookiePolicy).toHaveBeenCalledWith(LanguageCode.EN)

    const client = screen.getByTestId('cookie-policy-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-data', 'true')
  })

  it('should handle null data', async () => {
    mockGetCookiePolicy.mockResolvedValue(null)

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await CookiePolicyPage({ params })
    render(ui)

    expect(mockGetCookiePolicy).toHaveBeenCalledWith(LanguageCode.EN)

    const client = screen.getByTestId('cookie-policy-client')
    expect(client).toHaveAttribute('data-has-data', 'false')
  })
})
