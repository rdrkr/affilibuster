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
const mockNotFound = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  notFound: (...args: unknown[]) => mockNotFound(...args),
}))

// Mock content API
jest.mock('@/lib/content/api', () => ({
  getProfile: jest.fn(),
}))

// Mock auth API
const mockExportUserData = jest.fn()
const mockGetUserProfile = jest.fn()
jest.mock('@/lib/auth/api', () => ({
  exportUserData: (...args: unknown[]) => mockExportUserData(...args),
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}))

// Mock consent lib
const mockOpenCookieSettings = jest.fn()
jest.mock('@/lib/consent', () => ({
  openCookieSettings: (...args: unknown[]) => mockOpenCookieSettings(...args),
}))

// Mock newsletter lib
const mockUnsubscribeNewsletter = jest.fn()
jest.mock('@/lib/newsletter', () => ({
  unsubscribeNewsletter: (...args: unknown[]) => mockUnsubscribeNewsletter(...args),
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
  newsletterUnsubscribeHeader: {
    header: { text: 'Unsubscribe' },
    subheader: {
      text: 'Successfully unsubscribed from newsletter.',
      ariaDescription: 'Failed to unsubscribe. Please try again.',
    },
  },
  deleteAccountHeader: { header: { text: 'Delete Account' } },
  logoutButton: { label: { text: 'Log Out' } },
}

/** Mock user profile returned by getUserProfile */
const mockUserProfile = {
  id: 'test-uuid',
  email: 'alex@example.com',
  display_name: 'Alex G.',
  email_verified: true,
}

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileData)
    mockGetUserProfile.mockResolvedValue(mockUserProfile)
  })

  it('should render profile page with user display name', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByText('Alex G.')).toBeInTheDocument()
    })
  })

  it('should render account settings section', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /Account Settings/i })).toBeInTheDocument()
    })
  })

  it('should render edit profile link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      const editLinks = screen.getAllByRole('link', { name: /Edit Profile/i })
      expect(editLinks.length).toBeGreaterThan(0)
      expect(editLinks[0]).toHaveAttribute('href', '/en/profile/edit')
    })
  })

  it('should render currency link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Currency/i })).toHaveAttribute('href', '/en/profile/currency')
    })
  })

  it('should render wishlist link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Wishlist/i })).toHaveAttribute('href', '/en/profile/wishlist')
    })
  })

  it('should render logout button', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
    })
  })

  it('should render delete account link', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Delete Account/i })).toHaveAttribute('href', '/en/profile/delete')
    })
  })

  it('should render user email from profile API', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    })
  })

  it('should render loading spinner while profile loads', async () => {
    // Make getUserProfile hang
    mockGetUserProfile.mockReturnValue(new Promise(() => {}))

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    expect(screen.getByTestId('profile-loading')).toBeInTheDocument()
  })

  it('should redirect to login when getUserProfile returns null', async () => {
    mockGetUserProfile.mockResolvedValueOnce(null)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en/login')
    })
  })

  it('should render export data button with CMS label', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export My Data/i })).toBeInTheDocument()
    })
  })

  it('should render cookie settings button with CMS label', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cookie Settings/i })).toBeInTheDocument()
    })
  })

  it('should render newsletter unsubscribe button with CMS label', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unsubscribe/i })).toBeInTheDocument()
    })
  })

  it('should call openCookieSettings when cookie settings button is clicked', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cookie Settings/i })).toBeInTheDocument()
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export My Data/i })).toBeInTheDocument()
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export My Data/i })).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: /Export My Data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockExportUserData).toHaveBeenCalled()
      // Button should return to normal state
      expect(screen.getByRole('button', { name: /Export My Data/i })).not.toBeDisabled()
    })
  })

  it('should call unsubscribeNewsletter with profile email when unsubscribe button is clicked', async () => {
    mockUnsubscribeNewsletter.mockResolvedValueOnce({ success: true })

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    })

    const unsubscribeButton = screen.getByRole('button', { name: /Unsubscribe/i })
    fireEvent.click(unsubscribeButton)

    await waitFor(() => {
      expect(mockUnsubscribeNewsletter).toHaveBeenCalledWith('alex@example.com')
    })
  })

  it('should show success feedback after successful unsubscribe', async () => {
    mockUnsubscribeNewsletter.mockResolvedValueOnce({ success: true })

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unsubscribe/i })).toBeInTheDocument()
    })

    const unsubscribeButton = screen.getByRole('button', { name: /Unsubscribe/i })
    fireEvent.click(unsubscribeButton)

    await waitFor(() => {
      expect(screen.getByTestId('unsubscribe-success')).toHaveTextContent('Successfully unsubscribed from newsletter.')
    })
  })

  it('should show error feedback after failed unsubscribe', async () => {
    mockUnsubscribeNewsletter.mockResolvedValueOnce(null)

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unsubscribe/i })).toBeInTheDocument()
    })

    const unsubscribeButton = screen.getByRole('button', { name: /Unsubscribe/i })
    fireEvent.click(unsubscribeButton)

    await waitFor(() => {
      expect(screen.getByTestId('unsubscribe-error')).toHaveTextContent('Failed to unsubscribe. Please try again.')
    })
  })

  it('should show error feedback when unsubscribe returns success=false', async () => {
    mockUnsubscribeNewsletter.mockResolvedValueOnce({ success: false })

    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unsubscribe/i })).toBeInTheDocument()
    })

    const unsubscribeButton = screen.getByRole('button', { name: /Unsubscribe/i })
    fireEvent.click(unsubscribeButton)

    await waitFor(() => {
      expect(screen.getByTestId('unsubscribe-error')).toBeInTheDocument()
    })
  })

  it('should redirect to login on logout', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'en' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
    })

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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument()
    })

    // Wishlist link should still be rendered (href check)
    const links = screen.getAllByRole('link')
    const wishlistLink = links.find(link => link.getAttribute('href') === '/en/profile/wishlist')

    expect(wishlistLink).toBeInTheDocument()
    // Text inside should be empty or default
  })

  it('should render correctly in RTL', async () => {
    const ui = await Profile({ params: Promise.resolve({ lang: 'he' }) })
    render(ui)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    // We can just verify it renders successfullly, coverage for isRtl branch will be hit
  })

  it('should call notFound when profile page is null', async () => {
    ;(getProfile as jest.Mock).mockResolvedValueOnce(null)
    try {
      await Profile({ params: Promise.resolve({ lang: 'en' }) })
    } catch {
      // notFound throws an error
    }

    expect(mockNotFound).toHaveBeenCalled()
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
