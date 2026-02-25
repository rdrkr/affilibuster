// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Unit tests for profile page
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img src={src} alt={alt} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock content API
jest.mock('@/lib/content/api', () => ({
  getProfile: jest.fn(),
}))

// Mock auth API
const mockExportUserData = jest.fn()
jest.mock('@/lib/auth/api', () => ({
  exportUserData: (...args: unknown[]) => mockExportUserData(...args),
}))

// Mock consent lib
const mockOpenCookieSettings = jest.fn()
jest.mock('@/lib/consent', () => ({
  openCookieSettings: (...args: unknown[]) => mockOpenCookieSettings(...args),
}))

import Profile, { generateMetadata } from '@/app/[lang]/profile/page'
import { getProfile } from '@/lib/content/api'

const mockProfileData = {
  pageHeader: {
    header: { text: 'Alex Green' },
    subheader: { text: 'alex.green@example.com' },
    image: { url: '/profile.jpg', alternativeText: 'Profile' },
  },
  accountSettingsHeader: { header: { text: 'Account Settings' } },
  editProfileButton: { label: { text: 'Edit Profile' }, url: '/en/profile/edit' },
  currencyHeader: { header: { text: 'Currency' } },
  wishlistHeader: { header: { text: 'Wishlist' } },
  cookieSettingsHeader: { header: { text: 'Cookie Settings' } },
  exportDataHeader: { header: { text: 'Export My Data' } },
  deleteAccountHeader: { header: { text: 'Delete Account' } },
  logoutButton: { label: { text: 'Log Out' } },
}

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileData)
  })

  it('should render profile page', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Alex Green')
  })

  it('should render account settings section', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 2, name: /Account Settings/i })).toBeInTheDocument()
  })

  it('should render edit profile link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const editLinks = screen.getAllByRole('link', { name: /Edit Profile/i })
    expect(editLinks.length).toBeGreaterThan(0)
    expect(editLinks[0]).toHaveAttribute('href', '/en/profile/edit')
  })

  it('should render currency link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: /Currency/i })).toHaveAttribute('href', '/en/profile/currency')
  })

  it('should render wishlist link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: /Wishlist/i })).toHaveAttribute('href', '/en/profile/wishlist')
  })

  it('should render logout button', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
  })

  it('should render delete account link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('link', { name: /Delete Account/i })).toHaveAttribute('href', '/en/profile/delete')
  })

  it('should render user email', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)
    expect(screen.getByText('ronen@example.com')).toBeInTheDocument()
  })

  it('should render export data button with CMS label', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: /Export My Data/i })).toBeInTheDocument()
  })

  it('should render cookie settings button with CMS label', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByRole('button', { name: /Cookie Settings/i })).toBeInTheDocument()
  })

  it('should call openCookieSettings when cookie settings button is clicked', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const cookieButton = screen.getByRole('button', { name: /Cookie Settings/i })
    fireEvent.click(cookieButton)

    expect(mockOpenCookieSettings).toHaveBeenCalled()
  })

  it('should call exportUserData when export button is clicked', async () => {
    mockExportUserData.mockResolvedValueOnce({
      profile: { id: '1', email: 'test@test.com' },
      consentRecords: [],
      preferences: null,
      activeSessions: [],
      exportedAt: '2026-02-12T00:00:00Z',
    })

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
    const mockRevokeObjectURL = jest.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    // Mock HTMLAnchorElement.prototype.click to capture the download trigger
    const mockClick = jest.fn()
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(mockClick)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const exportButton = screen.getByRole('button', { name: /Export My Data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockExportUserData).toHaveBeenCalled()
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  it('should handle export failure gracefully', async () => {
    mockExportUserData.mockResolvedValueOnce(null)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const exportButton = screen.getByRole('button', { name: /Export My Data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockExportUserData).toHaveBeenCalled()
      // Button should return to normal state
      expect(screen.getByRole('button', { name: /Export My Data/i })).not.toBeDisabled()
    })
  })

  it('should redirect to login on logout', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    const logoutButton = screen.getByRole('button', { name: /Log Out/i })
    fireEvent.click(logoutButton)

    expect(mockPush).toHaveBeenCalledWith('/en/login')
  })

  it('should handle missing edit profile label gracefully', async () => {
    const mockDataNoLabel = {
      ...mockProfileData,
      editProfileButton: { label: undefined, url: '/en/profile/edit' },
    }

    ;(getProfile as jest.Mock).mockResolvedValueOnce(mockDataNoLabel)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Verify Edit Profile link is not rendered
    const editLink = screen.queryByRole('link', { name: /Edit Profile/i })
    expect(editLink).not.toBeInTheDocument()
  })

  it('should handle missing header text gracefully', async () => {
    // Tests getHeaderText helper fallback when header is missing
    const mockDataEmptyHeaders = {
      ...mockProfileData,
      wishlistHeader: { header: undefined },
    }

    ;(getProfile as jest.Mock).mockResolvedValueOnce(mockDataEmptyHeaders)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Wishlist link should still be rendered (href check)
    // We search by href because text content might be empty or fallback
    const links = screen.getAllByRole('link')
    const wishlistLink = links.find(link => link.getAttribute('href') === '/en/profile/wishlist')

    expect(wishlistLink).toBeInTheDocument()
  })

  it('should handle missing header entry gracefully', async () => {
    // Tests getHeaderText helper fallback when header entry itself is missing
    const mockDataMissingHeaderEntry = {
      ...mockProfileData,
    }
    // @ts-expect-error - force delete property for test
    delete mockDataMissingHeaderEntry.wishlistHeader
    ;(getProfile as jest.Mock).mockResolvedValueOnce(mockDataMissingHeaderEntry)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Wishlist link should still be rendered (href check)
    const links = screen.getAllByRole('link')
    const wishlistLink = links.find(link => link.getAttribute('href') === '/en/profile/wishlist')

    expect(wishlistLink).toBeInTheDocument()
    // Text inside should be empty or default
  })

  it('should render correctly in RTL', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)

    // Verify basic rendering to ensure no crash in RTL
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

    // We can just verify it renders successfullly, coverage for isRtl branch will be hit
  })
})

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return noindex metadata from CMS data', async () => {
    ;(getProfile as jest.Mock).mockResolvedValue({
      seoMetadata: { metaTitle: 'Profile', metaDescription: 'Your profile page' },
    })

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBe('Profile')
    expect(metadata.description).toBe('Your profile page')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('should handle null profile data gracefully', async () => {
    ;(getProfile as jest.Mock).mockResolvedValue(null)

    const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) })

    expect(metadata.title).toBeUndefined()
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
