// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for about page server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
  getAbout: jest.fn(),
  getContributors: jest.fn(),
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
import { getAbout, getContributors } from '@/lib/client'
import { CodeEnum, CurrencyCode, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetAbout = getAbout as jest.MockedFunction<typeof getAbout>
const mockGetContributors = getContributors as jest.MockedFunction<typeof getContributors>
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
    const mockContributors = [{ id: 1, name: 'Contributor' }]

    mockGetAbout.mockResolvedValue(mockAboutData as unknown as Awaited<ReturnType<typeof getAbout>>)
    // getContributors returns just the data array, not {data: [...]}
    mockGetContributors.mockResolvedValue(mockContributors as unknown as Awaited<ReturnType<typeof getContributors>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetAbout).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetContributors).toHaveBeenCalledWith({
      locale: CodeEnum.EN,
      filters: {
        roles: {
          roleId: {
            $nei: 'author',
          },
        },
      } as any,
    })
    expect(screen.getByTestId('about-client')).toBeInTheDocument()
    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('true')
  })

  it('should pass null when about data is not available', async () => {
    mockGetAbout.mockResolvedValue(null)
    mockGetContributors.mockResolvedValue(null)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('false')
  })

  it('should work with Italian locale', async () => {
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)
    // getContributors returns just the data array, not {data: [...]}
    mockGetContributors.mockResolvedValue([] as unknown as Awaited<ReturnType<typeof getContributors>>)

    await AboutPage({ params: Promise.resolve({ lang: CodeEnum.IT }) })

    expect(mockGetAbout).toHaveBeenCalledWith(CodeEnum.IT)
  })

  it('should pass through contributors from API response', async () => {
    const mockAboutData = { seoMetadata: { metaTitle: 'About Us' }, sections: [] }
    const mockContributors = [
      { id: 1, name: 'Team Member', roles: [{ roleId: 'ceo', name: 'CEO' }] },
      {
        id: 3,
        name: 'Team And Author',
        roles: [
          { roleId: 'cto', name: 'CTO' },
          { roleId: 'author', name: 'Author' },
        ],
      },
    ]

    mockGetAbout.mockResolvedValue(mockAboutData as unknown as Awaited<ReturnType<typeof getAbout>>)
    // getContributors returns just the data array, not {data: [...]}
    mockGetContributors.mockResolvedValue(mockContributors as unknown as Awaited<ReturnType<typeof getContributors>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    // Should show contributors returned by API (filtering happens on backend now)
    const aboutClient = screen.getByTestId('about-client')
    expect(aboutClient.getAttribute('data-contributor-count')).toBe('2')
    expect(screen.getByText('Team Member')).toBeInTheDocument()
    expect(screen.getByText('Team And Author')).toBeInTheDocument()

    // Verify filter was passed
    expect(mockGetContributors).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          roles: {
            roleId: {
              $nei: 'author',
            },
          },
        },
      })
    )
  })
})
