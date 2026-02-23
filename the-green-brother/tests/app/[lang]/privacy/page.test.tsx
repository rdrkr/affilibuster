// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for PrivacyPage server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the client module
jest.mock('@/lib/content', () => ({
  getPrivacy: jest.fn(),
}))

// Mock PrivacyPolicyClient
jest.mock('@/app/[lang]/privacy/PrivacyPolicyClient', () => {
  return function MockPrivacyPolicyClient({ data }: { data: unknown }) {
    return (
      <div data-testid="privacy-client" data-has-data={!!data}>
        PrivacyClient
      </div>
    )
  }
})

import { render, screen } from '@testing-library/react'

import PrivacyPage from '@/app/[lang]/privacy/page'
import { getPrivacy } from '@/lib/content'
import { LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'

const mockGetPrivacy = getPrivacy as jest.MockedFunction<typeof getPrivacy>

describe('PrivacyPage', () => {
  const mockPrivacyData = {
    documentId: 'privacy-1',
    id: 1,
    publishedAt: '2025-01-01',
    content: {
      id: 1,
      content: '# Privacy Policy',
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    mockGetPrivacy.mockResolvedValue(mockPrivacyData)
  })

  it('should fetch data and render client component', async () => {
    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await PrivacyPage({ params })
    render(ui)

    expect(mockGetPrivacy).toHaveBeenCalledWith(LanguageCode.EN, {})

    const client = screen.getByTestId('privacy-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-data', 'true')
  })

  it('should handle null data', async () => {
    mockGetPrivacy.mockResolvedValue(null)

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await PrivacyPage({ params })
    render(ui)

    expect(mockGetPrivacy).toHaveBeenCalledWith(LanguageCode.EN, {})

    const client = screen.getByTestId('privacy-client')
    expect(client).toHaveAttribute('data-has-data', 'false')
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const params = Promise.resolve({ lang: LanguageCode.EN })
    const ui = await PrivacyPage({ params })
    render(ui)

    expect(mockGetPrivacy).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
  })
})
