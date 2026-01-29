// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for about page server component
 */

// Mock the content module
jest.mock('@/lib/content', () => ({
  getAbout: jest.fn(),
  getTeamMembers: jest.fn(),
}))

// Mock the languages API
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock the AboutClient component
jest.mock('@/app/[lang]/about/AboutClient', () => ({
  __esModule: true,
  default: function MockAboutClient({
    aboutData,
    contributors,
  }: {
    aboutData: unknown
    contributors: { id: number | string; name: string; roles?: { roleId: string; name: string }[] }[]
  }) {
    return (
      <div
        data-testid="about-client"
        data-has-data={aboutData ? 'true' : 'false'}
        data-contributor-count={contributors.length}
      >
        {contributors.map(c => (
          <div key={c.id} data-testid="contributor">
            {c.name}
          </div>
        ))}
      </div>
    )
  },
}))

import AboutPage from '@/app/[lang]/about/page'
import { getAbout, getTeamMembers } from '@/lib/content'
import { CodeEnum, CurrencyCode, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetAbout = getAbout as jest.MockedFunction<typeof getAbout>
const mockGetTeamMembers = getTeamMembers as jest.MockedFunction<typeof getTeamMembers>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>

describe('AboutPage', () => {
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

  it('should fetch about data and pass to AboutClient', async () => {
    const mockAboutData = { seoMetadata: { metaTitle: 'About Us' }, sections: [] }
    const mockTeamMembersData = [{ id: 1, name: 'Contributor', roles: [{ roleId: 'ceo', name: 'CEO' }] }]

    mockGetAbout.mockResolvedValue(mockAboutData as unknown as Awaited<ReturnType<typeof getAbout>>)
    mockGetTeamMembers.mockResolvedValue(mockTeamMembersData as unknown as Awaited<ReturnType<typeof getTeamMembers>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetAbout).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetTeamMembers).toHaveBeenCalledWith(CodeEnum.EN)
    expect(screen.getByTestId('about-client')).toBeInTheDocument()
    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('true')
  })

  it('should pass null when about data is not available', async () => {
    mockGetAbout.mockResolvedValue(null)
    mockGetTeamMembers.mockResolvedValue([])

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('false')
  })

  it('should work with Italian locale', async () => {
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)
    mockGetTeamMembers.mockResolvedValue([])

    await AboutPage({ params: Promise.resolve({ lang: CodeEnum.IT }) })

    expect(mockGetAbout).toHaveBeenCalledWith(CodeEnum.IT)
  })

  it('should pass through contributors from API response', async () => {
    const mockAboutData = { seoMetadata: { metaTitle: 'About Us' }, sections: [] }
    const mockTeamMembersData = [
      { id: 1, name: 'Team Member', roles: [{ roleId: 'ceo', name: 'CEO' }] },
      {
        id: 3,
        name: 'Team And Author',
        roles: [{ roleId: 'cto', name: 'CTO' }],
      },
    ]

    mockGetAbout.mockResolvedValue(mockAboutData as unknown as Awaited<ReturnType<typeof getAbout>>)
    mockGetTeamMembers.mockResolvedValue(mockTeamMembersData as unknown as Awaited<ReturnType<typeof getTeamMembers>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    // Should show team members returned by getTeamMembers (filtering happens inside getTeamMembers)
    const aboutClient = screen.getByTestId('about-client')
    expect(aboutClient.getAttribute('data-contributor-count')).toBe('2')
    expect(screen.getByText('Team Member')).toBeInTheDocument()
    expect(screen.getByText('Team And Author')).toBeInTheDocument()

    // Verify getTeamMembers was called with just the locale
    expect(mockGetTeamMembers).toHaveBeenCalledWith(CodeEnum.EN)
  })
})
