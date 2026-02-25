// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for about page server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the content module
jest.mock('@/lib/content', () => ({
  getAbout: jest.fn(),
  getTeamMembers: jest.fn(),
  getNavigation: jest.fn(),
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

import AboutPage, { generateMetadata } from '@/app/[lang]/about/page'
import { getAbout, getNavigation, getTeamMembers } from '@/lib/content'
import { LanguageCode, CurrencyCode, DirectionEnum, SchemaEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetAbout = getAbout as jest.MockedFunction<typeof getAbout>
const mockGetTeamMembers = getTeamMembers as jest.MockedFunction<typeof getTeamMembers>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>

describe('AboutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    // Default languages mock with all required Language properties
    mockGetLanguages.mockResolvedValue([
      {
        code: LanguageCode.EN,
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
        code: LanguageCode.IT,
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
        code: LanguageCode.HE,
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

    const Component = await AboutPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetAbout).toHaveBeenCalledWith(LanguageCode.EN, {})
    expect(mockGetTeamMembers).toHaveBeenCalledWith(LanguageCode.EN)
    expect(screen.getByTestId('about-client')).toBeInTheDocument()
    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('true')
  })

  it('should pass null when about data is not available', async () => {
    mockGetAbout.mockResolvedValue(null)
    mockGetTeamMembers.mockResolvedValue([])

    const Component = await AboutPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('false')
  })

  it('should work with Italian locale', async () => {
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)
    mockGetTeamMembers.mockResolvedValue([])

    await AboutPage({ params: Promise.resolve({ lang: LanguageCode.IT }) })

    expect(mockGetAbout).toHaveBeenCalledWith(LanguageCode.IT, {})
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

    const Component = await AboutPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    // Should show team members returned by getTeamMembers (filtering happens inside getTeamMembers)
    const aboutClient = screen.getByTestId('about-client')
    expect(aboutClient.getAttribute('data-contributor-count')).toBe('2')
    expect(screen.getByText('Team Member')).toBeInTheDocument()
    expect(screen.getByText('Team And Author')).toBeInTheDocument()

    // Verify getTeamMembers was called with just the locale
    expect(mockGetTeamMembers).toHaveBeenCalledWith(LanguageCode.EN)
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const mockAboutData = { seoMetadata: { metaTitle: 'About Us' }, sections: [] }
    mockGetAbout.mockResolvedValue(mockAboutData as unknown as Awaited<ReturnType<typeof getAbout>>)
    mockGetTeamMembers.mockResolvedValue([])

    const Component = await AboutPage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetAbout).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS data', async () => {
    mockGetAbout.mockResolvedValue({
      seoMetadata: { metaTitle: 'About Us', metaDescription: 'Learn about us' },
    } as any)
    mockGetNavigation.mockResolvedValue({ siteTitle: 'TestSite' } as any)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBe('About Us')
    expect(metadata.description).toBe('Learn about us')
    expect(metadata.alternates?.canonical).toContain('/en/about')
  })

  it('should handle null CMS data gracefully', async () => {
    mockGetAbout.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.alternates?.canonical).toContain('/en/about')
  })
})
