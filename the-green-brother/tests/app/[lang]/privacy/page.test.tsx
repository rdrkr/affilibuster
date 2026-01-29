// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for PrivacyPage server component
 */

import { render, screen } from '@testing-library/react'

import PrivacyPage from '@/app/[lang]/privacy/page'
import { getPrivacy } from '@/lib/content'
import type { ApiPrivacyPrivacyDocument } from '@/lib/generated/types.gen'
import { CodeEnum } from '@/lib/generated/types.gen'

// Mock the client module
jest.mock('@/lib/content', () => ({
  getPrivacy: jest.fn(),
}))

const mockGetPrivacy = getPrivacy as jest.MockedFunction<typeof getPrivacy>

// Mock PrivacyPolicyClient
jest.mock('@/app/[lang]/privacy/PrivacyPolicyClient', () => {
  return function MockPrivacyPolicyClient({ data }: { data: ApiPrivacyPrivacyDocument | null }) {
    return (
      <div data-testid="privacy-client" data-has-data={!!data}>
        PrivacyClient
      </div>
    )
  }
})

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
    mockGetPrivacy.mockResolvedValue(mockPrivacyData)
  })

  it('should fetch data and render client component', async () => {
    const params = Promise.resolve({ lang: CodeEnum.EN })
    const ui = await PrivacyPage({ params })
    render(ui)

    expect(mockGetPrivacy).toHaveBeenCalledWith(CodeEnum.EN)

    const client = screen.getByTestId('privacy-client')
    expect(client).toBeInTheDocument()
    expect(client).toHaveAttribute('data-has-data', 'true')
  })

  it('should handle null data', async () => {
    mockGetPrivacy.mockResolvedValue(null)

    const params = Promise.resolve({ lang: CodeEnum.EN })
    const ui = await PrivacyPage({ params })
    render(ui)

    expect(mockGetPrivacy).toHaveBeenCalledWith(CodeEnum.EN)

    const client = screen.getByTestId('privacy-client')
    expect(client).toHaveAttribute('data-has-data', 'false')
  })
})
