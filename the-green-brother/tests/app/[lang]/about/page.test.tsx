// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for about page server component
 */

// Mock the client module
jest.mock('@/lib/client', () => ({
  getAbout: jest.fn(),
}))

// Mock the languages API
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock the AboutClient component
jest.mock('@/app/[lang]/about/AboutClient', () => ({
  __esModule: true,
  default: function MockAboutClient({ aboutData, direction }: { aboutData: unknown; direction?: string }) {
    return <div data-testid="about-client" data-has-data={aboutData ? 'true' : 'false'} data-direction={direction} />
  },
}))

import AboutPage from '@/app/[lang]/about/page'
import { getAbout } from '@/lib/client'
import { CodeEnum, CurrencyCode, DirectionEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetAbout = getAbout as jest.MockedFunction<typeof getAbout>
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
    mockGetAbout.mockResolvedValue(mockAboutData as unknown as Awaited<ReturnType<typeof getAbout>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetAbout).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetLanguages).toHaveBeenCalled()
    expect(screen.getByTestId('about-client')).toBeInTheDocument()
    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('true')
  })

  it('should pass null when about data is not available', async () => {
    mockGetAbout.mockResolvedValue(null)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-has-data')).toBe('false')
  })

  it('should work with Italian locale', async () => {
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)

    await AboutPage({ params: Promise.resolve({ lang: CodeEnum.IT }) })

    expect(mockGetAbout).toHaveBeenCalledWith(CodeEnum.IT)
  })

  it('should pass LTR direction for English locale', async () => {
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-direction')).toBe(DirectionEnum.LTR)
  })

  it('should pass RTL direction for Hebrew locale', async () => {
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.HE }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-direction')).toBe(DirectionEnum.RTL)
  })

  it('should default to LTR when languages API returns null', async () => {
    mockGetLanguages.mockResolvedValue(null)
    mockGetAbout.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getAbout>>)

    const Component = await AboutPage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(screen.getByTestId('about-client').getAttribute('data-direction')).toBe(DirectionEnum.LTR)
  })
})
