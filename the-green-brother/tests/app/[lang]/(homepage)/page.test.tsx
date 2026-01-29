// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for homepage server component
 */

// Mock the content module
jest.mock('@/lib/content', () => ({
  getHomepage: jest.fn(),
  getTeamMembers: jest.fn(),
  getBlog: jest.fn(),
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

import HomePage from '@/app/[lang]/(homepage)/page'
import { HomeSections } from '@/components/homepage'
import { getBlog, getHomepage, getTeamMembers } from '@/lib/content'
import { userProfileFlag } from '@/lib/feature-flags'
import { CodeEnum } from '@/lib/generated/types.gen'
import { render, screen } from '@testing-library/react'

const mockGetHomepage = getHomepage as jest.MockedFunction<typeof getHomepage>
const mockGetTeamMembers = getTeamMembers as jest.MockedFunction<typeof getTeamMembers>
const mockGetBlog = getBlog as jest.MockedFunction<typeof getBlog>
const mockUserProfileFlag = userProfileFlag as jest.MockedFunction<typeof userProfileFlag>
const mockHomeSections = HomeSections as unknown as jest.Mock

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetTeamMembers).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockGetBlog).toHaveBeenCalledWith(CodeEnum.EN)
    expect(screen.getByTestId('home-client')).toBeInTheDocument()
    expect(screen.getByTestId('home-sections')).toBeInTheDocument()
    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: mockHomepageData.sections,
        teamMembers: mockTeamMembers,
        enableUserProfile: false,
        readTimeMinutesLabel: mockBlogPage.readTimeMinutesLabel,
        readArticleLabel: mockBlogPage.readArticleLabel,
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

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [],
        teamMembers: [],
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

    const result = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })

    expect(result).toBeNull()
  })

  it('should return null if blog page response is missing', async () => {
    mockGetHomepage.mockResolvedValue({ sections: [] } as unknown as Awaited<ReturnType<typeof getHomepage>>)
    mockGetTeamMembers.mockResolvedValue([])
    mockGetBlog.mockResolvedValue(null)

    const result = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })

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

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.IT }) })
    render(Component)

    expect(mockGetHomepage).toHaveBeenCalledWith(CodeEnum.IT)
    expect(mockGetTeamMembers).toHaveBeenCalledWith(CodeEnum.IT)
    expect(mockGetBlog).toHaveBeenCalledWith(CodeEnum.IT)
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

    const Component = await HomePage({ params: Promise.resolve({ lang: CodeEnum.EN }) })
    render(Component)

    expect(mockGetTeamMembers).toHaveBeenCalledWith(CodeEnum.EN)
    expect(mockHomeSections).toHaveBeenCalledWith(
      expect.objectContaining({
        teamMembers: mockTeamMembers,
      }),
      undefined
    )
  })
})
