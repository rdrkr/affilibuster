// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for TermsPage server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the client module
jest.mock('@/lib/content', () => ({
  getTerm: jest.fn(),
  getNavigation: jest.fn(),
}))

// Mock TermsOfServiceClient
jest.mock('@/app/[lang]/terms/TermsOfServiceClient', () => {
  return function MockTermsOfServiceClient({ data }: { data: unknown }) {
    return (
      <div data-testid="terms-client" data-has-data={!!data}>
        TermsClient
      </div>
    )
  }
})

import { render, screen } from '@testing-library/react'

import TermsPage, { generateMetadata } from '@/app/[lang]/terms/page'
import { getNavigation, getTerm } from '@/lib/content'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'

const mockGetTerm = getTerm as jest.MockedFunction<typeof getTerm>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>

describe('TermsPage', () => {
  const mockTermData = {
    documentId: 'term-1',
    id: 1,
    publishedAt: '2025-01-01',
    content: {
      id: 1,
      content: '# Terms of Service',
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    mockGetTerm.mockResolvedValue(mockTermData)
  })

  it('should fetch data and render client component', async () => {
    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await TermsPage({ params })
    render(ui)

    expect(mockGetTerm).toHaveBeenCalledWith(LanguageCode.EN, {})

    const client = screen.getByTestId('terms-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-data', 'true')
  })

  it('should handle null data', async () => {
    mockGetTerm.mockResolvedValue(null)

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await TermsPage({ params })
    render(ui)

    expect(mockGetTerm).toHaveBeenCalledWith(LanguageCode.EN, {})

    const client = screen.getByTestId('terms-client')
    expect(client).toHaveAttribute('data-has-data', 'false')
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await TermsPage({ params })
    render(ui)

    expect(mockGetTerm).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS data', async () => {
    mockGetTerm.mockResolvedValue({
      seoMetadata: { metaTitle: 'Terms of Service', metaDescription: 'Our terms' },
    } as any)
    mockGetNavigation.mockResolvedValue({ siteTitle: 'TestSite' } as any)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBe('Terms of Service')
    expect(metadata.description).toBe('Our terms')
    expect(metadata.alternates?.canonical).toContain('/en/terms')
  })

  it('should handle null CMS data gracefully', async () => {
    mockGetTerm.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.alternates?.canonical).toContain('/en/terms')
  })
})
