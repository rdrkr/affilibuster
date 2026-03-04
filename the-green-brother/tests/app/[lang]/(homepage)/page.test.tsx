// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for homepage server component
 */

// Mock draft mode
const mockDraftMode = jest.fn().mockResolvedValue({ isEnabled: false })
jest.mock('next/headers', () => ({
  draftMode: (...args: unknown[]) => mockDraftMode(...args),
}))

// Mock the content module
jest.mock('@/lib/content', () => ({
  getHomepage: jest.fn(),
  getTeamMembers: jest.fn(),
  getBlog: jest.fn(),
  getNavigation: jest.fn(),
}))

// Mock languages API
jest.mock('@/lib/languages/api', () => ({
  getLanguages: jest.fn(),
}))

// Mock sections components
jest.mock('@/components/sections', () => ({
  ServerHeroSection: jest.fn(({ data, direction }: { data: unknown; direction: string }) => (
    <div data-testid="server-hero-section" data-direction={direction}>
      {JSON.stringify(data)}
    </div>
  )),
}))

// Mock feature flags to avoid jose ESM import issues
jest.mock('@/lib/feature-flags', () => ({
  userProfileFlag: jest.fn().mockResolvedValue(false),
}))

// Mock the HomeClient component
jest.mock('@/app/[lang]/(homepage)/HomeClient', () => ({
  __esModule: true,
  default: function MockHomeClient({ children }: { children: React.ReactNode }) {
    return <div data-testid="home-client">{children}</div>
  },
}))

// Mock HomeSections component
jest.mock('@/components/homepage', () => ({
  HomeSections: jest.fn(() => <div data-testid="home-sections" />),
}))

// Mock JsonLdScript component
jest.mock('@/components/seo', () => ({
  JsonLdScript: jest.fn(({ data }: { data: Record<string, unknown> }) => (
    <script type="application/ld+json" data-testid="json-ld">
      {JSON.stringify(data)}
    </script>
  )),
}))

import HomePage, { generateMetadata } from '@/app/[lang]/(homepage)/page'
import { HomeSections } from '@/components/homepage'
import { ServerHeroSection } from '@/components/sections'
import { JsonLdScript } from '@/components/seo'
import { getBlog, getHomepage, getNavigation, getTeamMembers } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { DirectionEnum, LanguageCode, SchemaEnum } from '@/lib/generated/types.gen'
import { getLanguages } from '@/lib/languages/api'
import { render, screen } from '@testing-library/react'

const mockGetHomepage = getHomepage as jest.MockedFunction<typeof getHomepage>
const mockGetTeamMembers = getTeamMembers as jest.MockedFunction<typeof getTeamMembers>
const mockGetBlog = getBlog as jest.MockedFunction<typeof getBlog>
const mockGetNavigation = getNavigation as jest.MockedFunction<typeof getNavigation>
const mockUserProfileFlag = userProfileFlag as jest.MockedFunction<typeof userProfileFlag>
const mockGetLanguages = getLanguages as jest.MockedFunction<typeof getLanguages>
const mockHomeSections = HomeSections as unknown as jest.Mock
const mockJsonLdScript = JsonLdScript as unknown as jest.Mock
const mockServerHeroSection = ServerHeroSection as unknown as jest.Mock

describe('HomePage', () => {
  const mockNavigationData = {
    siteTitle: 'TheGreenBrother',
    brandButton: { label: { icon: 'https://example.com/logo.png', text: 'Logo', ariaDescription: 'Logo' } },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockResolvedValue({ isEnabled: false })
    mockGetNavigation.mockResolvedValue(mockNavigationData as unknown as Awaited<ReturnType<typeof getNavigation>>)
    mockGetLanguages.mockResolvedValue([
      {
        code: LanguageCode.EN,
        displayName: 'English',
        nativeName: 'English',
        flag: '',
        direction: DirectionEnum.LTR,
        urlPrefix: 'en',
        defaultCurrency: 'USD' as never,
        localeCode: 'en',
        isDefault: true,
      },
    ])
  })

  it('should fetch data and pass to HomeSections', async () => {
    const mockHomepageData = { sections: [] }
    const mockTeamMembers = [{ id: 1, name: 'Team Member 1' }]
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue(mockTeamMembers as unknown as Awaited<ReturnType<typeof getTeamMembers>>)
    mockUserProfileFlag.mockResolvedValue(false)
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(LanguageCode.EN, {})
    expect(mockGetTeamMembers).toHaveBeenCalledWith(LanguageCode.EN)
    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.EN, {})
    expect(mockGetNavigation).toHaveBeenCalledWith(LanguageCode.EN)
    expect(mockGetLanguages).toHaveBeenCalled()
    expect(screen.getByTestId('home-client')).toBeInTheDocument()
    expect(screen.getByTestId('home-sections')).toBeInTheDocument()
    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: mockHomepageData.sections,
        teamMembers: mockTeamMembers,
        enableUserProfile: false,
        readTimeMinutesLabel: mockBlogPage.readTimeMinutesLabel,
        readArticleLabel: mockBlogPage.readArticleLabel,
        heroSlot: undefined,
      }),
      undefined
    )
  })

  it('should render JSON-LD structured data for Organization and WebSite', async () => {
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    // Should render two JsonLdScript components (Organization + WebSite)
    expect(mockJsonLdScript).toHaveBeenCalledTimes(2)
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'Organization', name: 'TheGreenBrother' }),
      }),
      undefined
    )
    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'WebSite', name: 'TheGreenBrother' }),
      }),
      undefined
    )
  })

  describe('Environment variable fallback for site URL', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should use custom NEXT_PUBLIC_SITE_URL and site name for JSON-LD', async () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-home.com'

      mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
      mockGetTeamMembers.mockResolvedValue([])
      mockGetBlog.mockResolvedValue({
        readTimeMinutesLabel: { text: '' },
        readArticleLabel: { text: '' },
      } as unknown as Awaited<ReturnType<typeof getBlog>>)
      mockGetNavigation.mockResolvedValue({
        siteTitle: 'CustomSite',
        brandButton: { label: { icon: 'logo.png' } },
      } as any)

      const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
      render(Component)

      expect(mockJsonLdScript).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            '@type': 'Organization',
            url: 'https://custom-home.com',
            name: 'CustomSite',
          }),
        }),
        undefined
      )
    })

    it('should use fallback URL when NEXT_PUBLIC_SITE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL

      mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
      mockGetTeamMembers.mockResolvedValue([])
      mockGetBlog.mockResolvedValue({
        readTimeMinutesLabel: { text: '' },
        readArticleLabel: { text: '' },
      } as unknown as Awaited<ReturnType<typeof getBlog>>)
      mockGetNavigation.mockResolvedValue({
        siteTitle: 'TheGreenBrotherFallback',
        brandButton: { label: { icon: 'logo.png' } },
      } as any)

      const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
      render(Component)

      expect(mockJsonLdScript).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            '@type': 'WebSite',
            url: 'http://localhost:3000',
            name: 'TheGreenBrotherFallback',
          }),
        }),
        undefined
      )
    })
  })

  it('should use fallback site name when navigation is null', async () => {
    mockGetNavigation.mockResolvedValue(null)

    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockJsonLdScript).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ '@type': 'Organization', name: 'TheGreenBrother' }),
      }),
      undefined
    )
  })

  it('should pass empty arrays when team members response is empty', async () => {
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [],
        teamMembers: [],
        heroSlot: undefined,
      }),
      undefined
    )
  })

  it('should return null if homepage data is missing', async () => {
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(null)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const result = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(result).toBeNull()
  })

  it('should return null if blog page response is missing', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(null)

    const result = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(result).toBeNull()
  })

  it('should work with Italian locale', async () => {
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Leggi' },
    }

    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.IT }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(LanguageCode.IT, {})
    expect(mockGetTeamMembers).toHaveBeenCalledWith(LanguageCode.IT)
    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.IT, {})
    expect(mockGetNavigation).toHaveBeenCalledWith(LanguageCode.IT)
  })

  it('should fetch team members and pass to HomeSections', async () => {
    const mockTeamMembers = [
      { id: 1, name: 'Member 1', roles: [{ roleId: 'founder' }] },
      { id: 2, name: 'Member 2', roles: [{ roleId: 'developer' }] },
    ]
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue(mockTeamMembers as unknown as Awaited<ReturnType<typeof getTeamMembers>>)
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetTeamMembers).toHaveBeenCalledWith(LanguageCode.EN)
    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        teamMembers: mockTeamMembers,
        heroSlot: undefined,
      }),
      undefined
    )
  })

  it('should pass draft status when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({ isEnabled: true })

    const mockHomepageData = { sections: [] }
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
    expect(mockGetBlog).toHaveBeenCalledWith(LanguageCode.EN, { status: SchemaEnum.DRAFT })
  })

  it('should provide heroSlot when sections contain a hero entry', async () => {
    const heroEntry = {
      __component: 'sections.hero' as const,
      id: 1,
      header: { title: 'Hero Title' },
      image: { url: '/hero.jpg' },
    }
    const mockHomepageData = { sections: [heroEntry] }
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    // heroSlot is a React element passed as a prop; HomeSections is mocked so it won't render it.
    // Verify the element type and props via the HomeSections call args.
    const heroSlotArg = mockHomeSections.mock.calls[0][0].heroSlot
    expect(heroSlotArg).toBeDefined()
    expect(heroSlotArg.type).toBe(mockServerHeroSection)
    expect(heroSlotArg.props).toEqual(
      expect.objectContaining({
        data: heroEntry,
        direction: DirectionEnum.LTR,
      })
    )
  })

  it('should not provide heroSlot when sections have no hero entry', async () => {
    const nonHeroEntry = {
      __component: 'sections.team' as const,
      id: 1,
    }
    const mockHomepageData = { sections: [nonHeroEntry] }
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    const heroSlotArg = mockHomeSections.mock.calls[0][0].heroSlot
    expect(heroSlotArg).toBeUndefined()
  })

  it('should derive RTL direction from getLanguages for hero slot', async () => {
    mockGetLanguages.mockResolvedValue([
      {
        code: LanguageCode.HE,
        displayName: 'Hebrew',
        nativeName: 'Hebrew',
        flag: '',
        direction: DirectionEnum.RTL,
        urlPrefix: 'he',
        defaultCurrency: 'ILS' as never,
        localeCode: 'he',
        isDefault: false,
      },
    ])

    const heroEntry = {
      __component: 'sections.hero' as const,
      id: 1,
      header: { title: 'Hero Title' },
      image: { url: '/hero.jpg' },
    }
    const mockHomepageData = { sections: [heroEntry] }
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.HE }) })
    render(Component)

    const heroSlotArg = mockHomeSections.mock.calls[0][0].heroSlot
    expect(heroSlotArg).toBeDefined()
    expect(heroSlotArg.props).toEqual(
      expect.objectContaining({
        data: heroEntry,
        direction: DirectionEnum.RTL,
      })
    )
  })

  it('should fallback to LTR direction when getLanguages returns null', async () => {
    mockGetLanguages.mockResolvedValue(null)

    const heroEntry = {
      __component: 'sections.hero' as const,
      id: 1,
      header: { title: 'Hero Title' },
      image: { url: '/hero.jpg' },
    }
    const mockHomepageData = { sections: [heroEntry] }
    const mockBlogPage = {
      readTimeMinutesLabel: { text: 'min' },
      readArticleLabel: { text: 'Read' },
    }

    mockGetHomepage.mockResolvedValue(mockHomepageData as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(mockBlogPage as unknown as Awaited<ReturnType<typeof getBlog>>)

    const Component = await HomePage({ params: Promise.resolve({ lang: LanguageCode.EN }) })
    render(Component)

    const heroSlotArg = mockHomeSections.mock.calls[0][0].heroSlot
    expect(heroSlotArg).toBeDefined()
    expect(heroSlotArg.props).toEqual(
      expect.objectContaining({
        data: heroEntry,
        direction: DirectionEnum.LTR,
      })
    )
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return metadata from CMS data', async () => {
    mockGetHomepage.mockResolvedValue({
      seoMetadata: { metaTitle: 'Home', metaDescription: 'Welcome home' },
    } as any)
    mockGetNavigation.mockResolvedValue({ siteTitle: 'TestSite' } as any)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBe('Home')
    expect(metadata.description).toBe('Welcome home')
    expect(metadata.alternates?.canonical).toContain('/en')
  })

  it('should handle null CMS data gracefully', async () => {
    mockGetHomepage.mockResolvedValue(null)
    mockGetNavigation.mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: LanguageCode.EN }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.alternates?.canonical).toContain('/en')
  })
})
