// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for CookieConsentBanner component.
 *
 * Verifies rendering, user interactions, RTL/LTR support,
 * settings panel, consent flow, and edit mode for consent withdrawal.
 */

import { act, fireEvent, render, screen } from '@testing-library/react'

import CookieConsentBanner from '@/components/consent/CookieConsentBanner'
import * as consentLib from '@/lib/consent'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock the consent library
jest.mock('@/lib/consent', () => ({
  getConsentPage: jest.fn(),
  getConsentCategories: jest.fn(),
  useConsent: jest.fn(),
}))

// Mock TextBlock component
jest.mock('@/components/elements', () => ({
  TextBlock: function MockTextBlock({ data }: { data: { content?: string } }) {
    return <div data-testid="mock-textblock">{data.content}</div>
  },
}))

const mockGetConsentPage = consentLib.getConsentPage as jest.MockedFunction<typeof consentLib.getConsentPage>
const mockGetConsentCategories = consentLib.getConsentCategories as jest.MockedFunction<
  typeof consentLib.getConsentCategories
>
const mockUseConsent = consentLib.useConsent as jest.MockedFunction<typeof consentLib.useConsent>

/** Mock consent page CMS data. */
const mockConsentPageData = {
  data: {
    documentId: 'consent-1',
    id: 1,
    publishedAt: '2026-01-01T00:00:00Z',
    consentInformation: { content: 'We use cookies for your experience.' },
    acceptAllButton: {
      url: '#',
      openInNewTab: false,
      label: { text: 'Accept All', ariaDescription: 'Accept all cookies', iconPosition: 'before_text' as const },
    },
    rejectAllButton: {
      url: '#',
      openInNewTab: false,
      label: { text: 'Reject All', ariaDescription: 'Reject all cookies', iconPosition: 'before_text' as const },
    },
    settingsButton: {
      url: '#',
      openInNewTab: false,
      label: { text: 'Customize', ariaDescription: 'Customize cookies', iconPosition: 'before_text' as const },
    },
    doNotTrackNotice: { content: 'Default Do Not Track notice.' },
    saveButton: {
      url: '#',
      openInNewTab: false,
      label: { text: 'Save Preferences', ariaDescription: 'Save preferences', iconPosition: 'before_text' as const },
    },
  },
  meta: {},
}

/** Mock consent categories CMS data. */
const mockCategoriesData = {
  data: [
    {
      documentId: 'cat-1',
      id: 1,
      uid: 'necessary',
      required: true,
      publishedAt: '2026-01-01T00:00:00Z',
      content: { content: '**Necessary** - Required cookies' },
    },
    {
      documentId: 'cat-2',
      id: 2,
      uid: 'analytics',
      required: false,
      publishedAt: '2026-01-01T00:00:00Z',
      content: { content: '**Analytics** - Performance tracking' },
    },
    {
      documentId: 'cat-3',
      id: 3,
      uid: 'marketing',
      required: false,
      publishedAt: '2026-01-01T00:00:00Z',
      content: { content: '**Marketing** - Advertising cookies' },
    },
  ],
  meta: {},
}

/** Default mock return for useConsent hook. */
const defaultUseConsentReturn: consentLib.UseConsentReturn = {
  hasConsented: false,
  acceptedCategories: [],
  isSettingsOpen: false,
  isDoNotTrackEnabled: false,
  acceptAll: jest.fn(),
  rejectAll: jest.fn(),
  saveCustom: jest.fn(),
  openSettings: jest.fn(),
  closeSettings: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn })
  mockGetConsentPage.mockResolvedValue(
    mockConsentPageData as unknown as Awaited<ReturnType<typeof consentLib.getConsentPage>>
  )
  mockGetConsentCategories.mockResolvedValue(
    mockCategoriesData as unknown as Awaited<ReturnType<typeof consentLib.getConsentCategories>>
  )
})

describe('CookieConsentBanner', () => {
  describe('rendering', () => {
    it('should render banner with CMS content after loading', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('We use cookies for your experience.')).toBeInTheDocument()
      expect(screen.getByText('Accept All')).toBeInTheDocument()
      expect(screen.getByText('Reject All')).toBeInTheDocument()
      expect(screen.getByText('Customize')).toBeInTheDocument()
    })

    it('should not render when user has already consented', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
      })

      const { container } = render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

      expect(container.innerHTML).toBe('')
    })

    it('should not render when CMS data fails to load', async () => {
      mockGetConsentPage.mockResolvedValue(null)
      mockGetConsentCategories.mockResolvedValue(null)

      let container: HTMLElement
      await act(async () => {
        const result = render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
        container = result.container
      })

      expect(container!.innerHTML).toBe('')
    })

    it('should fetch CMS data with the provided locale', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="it" direction={DirectionEnum.LTR} />)
      })

      expect(mockGetConsentPage).toHaveBeenCalledWith('it')
      expect(mockGetConsentCategories).toHaveBeenCalledWith('it')
    })
  })

  describe('RTL support', () => {
    it('should set dir attribute to rtl for Hebrew', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="he" direction={DirectionEnum.RTL} />)
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('dir', 'rtl')
    })

    it('should set dir attribute to ltr for English', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('dir', 'ltr')
    })

    it('should reverse button order for RTL', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="he" direction={DirectionEnum.RTL} />)
      })

      const buttonsContainer = screen.getByText('Accept All').parentElement
      expect(buttonsContainer?.className).toContain('flex-row-reverse')
    })
  })

  describe('accept all flow', () => {
    it('should call acceptAll with all category UIDs on accept button click', async () => {
      const mockAcceptAll = jest.fn()
      mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn, acceptAll: mockAcceptAll })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Accept All'))

      expect(mockAcceptAll).toHaveBeenCalledWith(['necessary', 'analytics', 'marketing'], '2026-01-01T00:00:00Z')
    })
  })

  describe('reject all flow', () => {
    it('should not call rejectAll when no required category UID exists', async () => {
      const mockRejectAll = jest.fn()
      mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn, rejectAll: mockRejectAll })

      mockGetConsentCategories.mockResolvedValue({
        data: [],
        meta: {},
      } as unknown as Awaited<ReturnType<typeof consentLib.getConsentCategories>>)

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Reject All'))

      expect(mockRejectAll).not.toHaveBeenCalled()
    })

    it('should call rejectAll with necessary category UID on reject button click', async () => {
      const mockRejectAll = jest.fn()
      mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn, rejectAll: mockRejectAll })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Reject All'))

      expect(mockRejectAll).toHaveBeenCalledWith('necessary', '2026-01-01T00:00:00Z')
    })
  })

  describe('settings panel', () => {
    it('should show settings panel when customize button is clicked', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.queryByText('**Necessary** - Required cookies')).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Customize'))

      expect(screen.getByText('**Necessary** - Required cookies')).toBeInTheDocument()
      expect(screen.getByText('**Analytics** - Performance tracking')).toBeInTheDocument()
      expect(screen.getByText('**Marketing** - Advertising cookies')).toBeInTheDocument()
    })

    it('should hide settings panel when customize button is clicked again', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      const customizeButton = screen.getByText('Customize')
      fireEvent.click(customizeButton)
      expect(screen.getByText('**Necessary** - Required cookies')).toBeInTheDocument()

      fireEvent.click(customizeButton)
      expect(screen.queryByText('**Necessary** - Required cookies')).not.toBeInTheDocument()
    })

    it('should pre-check required categories', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Customize'))

      const checkboxes = screen.getAllByRole('checkbox')
      // Necessary (required=true) should be checked and disabled
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[0]).toBeDisabled()
      // Analytics (required=false) should be unchecked
      expect(checkboxes[1]).not.toBeChecked()
      expect(checkboxes[1]).not.toBeDisabled()
      // Marketing (required=false) should be unchecked
      expect(checkboxes[2]).not.toBeChecked()
      expect(checkboxes[2]).not.toBeDisabled()
    })

    it('should toggle optional category checkboxes', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Customize'))

      const checkboxes = screen.getAllByRole('checkbox')
      const analyticsCheckbox = checkboxes[1]!
      // Toggle analytics on
      fireEvent.click(analyticsCheckbox)
      expect(analyticsCheckbox).toBeChecked()

      // Toggle analytics off
      fireEvent.click(analyticsCheckbox)
      expect(analyticsCheckbox).not.toBeChecked()
    })

    it('should not allow toggling required categories', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Customize'))

      const checkboxes = screen.getAllByRole('checkbox')
      const necessaryCheckbox = checkboxes[0]!
      // Necessary checkbox should remain checked even after click attempt
      fireEvent.click(necessaryCheckbox)
      expect(necessaryCheckbox).toBeChecked()
    })

    it('should call saveCustom with selected categories on save', async () => {
      const mockSaveCustom = jest.fn()
      mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn, saveCustom: mockSaveCustom })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      // Open settings
      fireEvent.click(screen.getByText('Customize'))

      // Toggle analytics on
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1]!)

      // Save
      fireEvent.click(screen.getByText('Save Preferences'))

      expect(mockSaveCustom).toHaveBeenCalledWith(['necessary', 'analytics'], '2026-01-01T00:00:00Z')
    })

    it('should show save button in settings panel', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.queryByText('Save Preferences')).not.toBeInTheDocument()

      fireEvent.click(screen.getByText('Customize'))

      expect(screen.getByText('Save Preferences')).toBeInTheDocument()
    })
  })

  describe('edit mode (consent withdrawal)', () => {
    it('should render banner when isSettingsOpen is true even if user has consented', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary', 'analytics'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should show close button in edit mode', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary', 'analytics'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.getByLabelText('Close cookie settings')).toBeInTheDocument()
    })

    it('should not show close button when not in edit mode', async () => {
      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.queryByLabelText('Close cookie settings')).not.toBeInTheDocument()
    })

    it('should call closeSettings when close button is clicked in edit mode', async () => {
      const mockCloseSettings = jest.fn()
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isSettingsOpen: true,
        closeSettings: mockCloseSettings,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByLabelText('Close cookie settings'))

      expect(mockCloseSettings).toHaveBeenCalled()
    })

    it('should auto-open settings panel in edit mode', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary', 'analytics'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      // Settings panel should be automatically visible in edit mode
      expect(screen.getByText('**Necessary** - Required cookies')).toBeInTheDocument()
      expect(screen.getByText('**Analytics** - Performance tracking')).toBeInTheDocument()
    })

    it('should pre-fill saved categories in edit mode', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary', 'analytics'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      const checkboxes = screen.getAllByRole('checkbox')
      // Necessary should be checked (was in acceptedCategories)
      expect(checkboxes[0]).toBeChecked()
      // Analytics should be checked (was in acceptedCategories)
      expect(checkboxes[1]).toBeChecked()
      // Marketing should not be checked (was not in acceptedCategories)
      expect(checkboxes[2]).not.toBeChecked()
    })

    it('should not show Customize button in edit mode', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.queryByText('Customize')).not.toBeInTheDocument()
    })

    it('should show Accept All and Reject All buttons in edit mode', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.getByText('Accept All')).toBeInTheDocument()
      expect(screen.getByText('Reject All')).toBeInTheDocument()
    })

    it('should fetch CMS data when entering edit mode', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(mockGetConsentPage).toHaveBeenCalledWith('en')
      expect(mockGetConsentCategories).toHaveBeenCalledWith('en')
    })

    it('should position close button based on RTL direction', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="he" direction={DirectionEnum.RTL} />)
      })

      const closeButton = screen.getByLabelText('Close cookie settings')
      const closeContainer = closeButton.parentElement
      expect(closeContainer?.className).toContain('justify-start')
    })

    it('should position close button to the end for LTR direction', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isSettingsOpen: true,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      const closeButton = screen.getByLabelText('Close cookie settings')
      const closeContainer = closeButton.parentElement
      expect(closeContainer?.className).toContain('justify-end')
    })
  })

  describe('Do Not Track', () => {
    it('should auto-reject when Do Not Track is enabled and no prior consent', async () => {
      const mockRejectAll = jest.fn()
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        isDoNotTrackEnabled: true,
        rejectAll: mockRejectAll,
      })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(mockRejectAll).toHaveBeenCalledWith('necessary', '2026-01-01T00:00:00Z')
    })

    it('should use fallback version in DNT auto-reject when publishedAt is missing', async () => {
      const mockRejectAll = jest.fn()
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        isDoNotTrackEnabled: true,
        rejectAll: mockRejectAll,
      })

      const dataWithoutPublishedAt = {
        ...mockConsentPageData,
        data: { ...mockConsentPageData.data, publishedAt: undefined },
      }
      mockGetConsentPage.mockResolvedValue(
        dataWithoutPublishedAt as unknown as Awaited<ReturnType<typeof consentLib.getConsentPage>>
      )

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(mockRejectAll).toHaveBeenCalledWith('necessary', '1.0')
    })

    it('should not auto-reject when Do Not Track is enabled but no required category exists', async () => {
      const mockRejectAll = jest.fn()
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        isDoNotTrackEnabled: true,
        rejectAll: mockRejectAll,
      })

      const categoriesNoRequired = {
        data: [
          {
            documentId: 'cat-1',
            id: 1,
            uid: 'optional-1',
            required: false,
            publishedAt: '2026-01-01',
            content: { content: 'Optional category' },
          },
        ],
        meta: {},
      }
      mockGetConsentCategories.mockResolvedValue(
        categoriesNoRequired as unknown as Awaited<ReturnType<typeof consentLib.getConsentCategories>>
      )

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(mockRejectAll).not.toHaveBeenCalled()
    })

    it('should not auto-reject when Do Not Track is enabled but consent already exists', async () => {
      const mockRejectAll = jest.fn()
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
        isDoNotTrackEnabled: true,
        rejectAll: mockRejectAll,
      })

      render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

      expect(mockRejectAll).not.toHaveBeenCalled()
    })

    it('should show Do Not Track notice when enabled and notice exists in CMS data', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        isDoNotTrackEnabled: true,
      })

      const consentPageWithDNT = {
        ...mockConsentPageData,
        data: {
          ...mockConsentPageData.data,
          doNotTrackNotice: { content: 'Do Not Track is enabled in your browser.' },
        },
      }
      mockGetConsentPage.mockResolvedValue(
        consentPageWithDNT as unknown as Awaited<ReturnType<typeof consentLib.getConsentPage>>
      )

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.getByTestId('dnt-notice')).toBeInTheDocument()
      expect(screen.getByText('Do Not Track is enabled in your browser.')).toBeInTheDocument()
    })

    it('should not show Do Not Track notice when Do Not Track is disabled', async () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        isDoNotTrackEnabled: false,
      })

      const consentPageWithDNT = {
        ...mockConsentPageData,
        data: {
          ...mockConsentPageData.data,
          doNotTrackNotice: { content: 'Do Not Track is enabled.' },
        },
      }
      mockGetConsentPage.mockResolvedValue(
        consentPageWithDNT as unknown as Awaited<ReturnType<typeof consentLib.getConsentPage>>
      )

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      expect(screen.queryByTestId('dnt-notice')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle missing consent page data gracefully', async () => {
      mockGetConsentPage.mockResolvedValue({ data: null, meta: {} } as unknown as Awaited<
        ReturnType<typeof consentLib.getConsentPage>
      >)

      let container: HTMLElement
      await act(async () => {
        const result = render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
        container = result.container
      })

      expect(container!.innerHTML).toBe('')
    })

    it('should handle empty categories list', async () => {
      mockGetConsentCategories.mockResolvedValue({
        data: [],
        meta: {},
      } as unknown as Awaited<ReturnType<typeof consentLib.getConsentCategories>>)

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Customize'))

      const checkboxes = screen.queryAllByRole('checkbox')
      expect(checkboxes).toHaveLength(0)
    })

    it('should use publishedAt as consent version', async () => {
      const mockAcceptAll = jest.fn()
      mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn, acceptAll: mockAcceptAll })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Accept All'))

      expect(mockAcceptAll).toHaveBeenCalledWith(expect.any(Array), '2026-01-01T00:00:00Z')
    })

    it('should fall back to default version when publishedAt is missing', async () => {
      const dataWithoutPublishedAt = {
        ...mockConsentPageData,
        data: { ...mockConsentPageData.data, publishedAt: undefined },
      }
      mockGetConsentPage.mockResolvedValue(
        dataWithoutPublishedAt as unknown as Awaited<ReturnType<typeof consentLib.getConsentPage>>
      )
      const mockAcceptAll = jest.fn()
      mockUseConsent.mockReturnValue({ ...defaultUseConsentReturn, acceptAll: mockAcceptAll })

      await act(async () => {
        render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
      })

      fireEvent.click(screen.getByText('Accept All'))

      expect(mockAcceptAll).toHaveBeenCalledWith(expect.any(Array), '1.0')
    })

    it('should not render when no required category found in CMS data', async () => {
      const categoriesWithNoRequired = {
        data: [
          {
            documentId: 'cat-1',
            id: 1,
            uid: 'optional-1',
            required: false,
            publishedAt: '2026-01-01',
            content: { content: 'Optional 1' },
          },
        ],
        meta: {},
      }
      mockGetConsentCategories.mockResolvedValue(
        categoriesWithNoRequired as unknown as Awaited<ReturnType<typeof consentLib.getConsentCategories>>
      )

      let container: HTMLElement
      await act(async () => {
        const result = render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)
        container = result.container
      })

      expect(container!.innerHTML).toBe('')
    })

    it('should not fetch data when user has already consented and settings not open', () => {
      mockUseConsent.mockReturnValue({
        ...defaultUseConsentReturn,
        hasConsented: true,
        acceptedCategories: ['necessary'],
      })

      render(<CookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

      expect(mockGetConsentPage).not.toHaveBeenCalled()
      expect(mockGetConsentCategories).not.toHaveBeenCalled()
    })
  })
})
