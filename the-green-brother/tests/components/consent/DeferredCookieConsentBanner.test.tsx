// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for DeferredCookieConsentBanner component.
 * Verifies deferred loading via user interaction events and fallback timeout.
 */

import { act, render, screen } from '@testing-library/react'

// Mock CookieConsentBanner — the actual banner loaded after activation
jest.mock('@/components/consent/CookieConsentBanner', () => ({
  __esModule: true,
  default: function MockCookieConsentBanner({ lang, direction }: { lang: string; direction: string }) {
    return (
      <div data-testid="mock-cookie-consent-banner" data-lang={lang} data-direction={direction}>
        Cookie Consent
      </div>
    )
  },
}))

// Mock next/dynamic to render synchronously in tests
jest.mock('next/dynamic', () => {
  return function mockDynamic(loader: () => Promise<{ default: React.ComponentType }>) {
    let Component: React.ComponentType | null = null
    void loader().then(mod => {
      Component = mod.default
    })

    /**
     * Mock dynamic component that renders synchronously after module resolution.
     * @param props - Props to pass to the resolved component
     * @returns The resolved component with props
     */
    function DynamicComponent(props: Record<string, unknown>) {
      if (!Component) return null
      return <Component {...props} />
    }
    DynamicComponent.displayName = 'MockDynamic'
    return DynamicComponent
  }
})

jest.mock('@/lib/consent', () => ({
  useConsent: jest.fn(() => ({
    hasConsented: false,
    acceptedCategories: [],
    isSettingsOpen: false,
    isDoNotTrackEnabled: false,
    cookieDntState: undefined,
    acceptAll: jest.fn(),
    rejectAll: jest.fn(),
    saveCustom: jest.fn(),
    openSettings: jest.fn(),
    closeSettings: jest.fn(),
  })),
}))

import DeferredCookieConsentBanner from '@/components/consent/DeferredCookieConsentBanner'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('DeferredCookieConsentBanner', () => {
  let addEventListenerSpy: jest.SpyInstance
  let removeEventListenerSpy: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    // Reset the useConsent mock to its default state before each test
    const { useConsent } = require('@/lib/consent')
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: false,
      acceptedCategories: [],
      isSettingsOpen: false,
      isDoNotTrackEnabled: false,
      cookieDntState: undefined,
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
    jest.restoreAllMocks()
  })

  it('should not render banner before user interaction', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()
  })

  it('should render banner after scroll event', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should render banner after click event', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should render banner after keydown event', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('keydown'))
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should render banner after touchstart event', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('touchstart'))
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should not activate on mousemove', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('mousemove'))
    })

    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()
  })

  it('should pass lang and direction props to CookieConsentBanner', () => {
    render(<DeferredCookieConsentBanner lang="he" direction={DirectionEnum.RTL} />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    const banner = screen.getByTestId('mock-cookie-consent-banner')
    expect(banner).toHaveAttribute('data-lang', 'he')
    expect(banner).toHaveAttribute('data-direction', DirectionEnum.RTL)
  })

  it('should register all activation events with passive and once options', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    const expectedEvents = ['scroll', 'click', 'keydown', 'touchstart']

    for (const event of expectedEvents) {
      const call = addEventListenerSpy.mock.calls.find(
        (c: [string, EventListener, AddEventListenerOptions]) => c[0] === event
      )
      expect(call).toBeDefined()
      expect(call[2]).toEqual({ passive: true, once: true })
    }
  })

  it('should not activate before fallback delay elapses', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      jest.advanceTimersByTime(7999)
    })

    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()
  })

  it('should activate via fallback timeout after 8 seconds', () => {
    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(8000)
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should clean up event listeners and timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    unmount()

    const expectedEvents = ['scroll', 'click', 'keydown', 'touchstart']
    for (const event of expectedEvents) {
      const call = removeEventListenerSpy.mock.calls.find((c: [string, EventListener]) => c[0] === event)
      expect(call).toBeDefined()
    }

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('should not set up activation timeouts or listeners if shouldShow is false', () => {
    // Mock useConsent to return hasConsented = true, which makes shouldShow = false
    const { useConsent } = require('@/lib/consent')
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: true,
      acceptedCategories: ['required'],
      isSettingsOpen: false,
      isDoNotTrackEnabled: false,
      cookieDntState: false,
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout')

    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    expect(addEventListenerSpy).not.toHaveBeenCalled()
    expect(setTimeoutSpy).not.toHaveBeenCalled()
    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()

    setTimeoutSpy.mockRestore()
  })

  it('should show banner if hasConsented is true but isSettingsOpen is true', () => {
    const { useConsent } = require('@/lib/consent')
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: true,
      acceptedCategories: ['required'],
      isSettingsOpen: true, // This should make shouldShow = true
      isDoNotTrackEnabled: false,
      cookieDntState: false,
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should show banner if dnt was turned on after consent', () => {
    const { useConsent } = require('@/lib/consent')
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: true,
      acceptedCategories: ['required', 'analytics'], // Has categories
      isSettingsOpen: false,
      isDoNotTrackEnabled: true, // DNT is now ON
      cookieDntState: false, // DNT was OFF when consented
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(screen.getByTestId('mock-cookie-consent-banner')).toBeInTheDocument()
  })

  it('should not show banner if dnt is enabled but was also enabled during consent', () => {
    const { useConsent } = require('@/lib/consent')
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: true,
      acceptedCategories: ['required', 'analytics'],
      isSettingsOpen: false,
      isDoNotTrackEnabled: true,
      cookieDntState: true, // DNT matches current state
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()
  })

  it('should not render anything if isActivated is false but shouldShow is true', () => {
    const { useConsent } = require('@/lib/consent')
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: false, // makes shouldShow = true
      acceptedCategories: [],
      isSettingsOpen: false,
      isDoNotTrackEnabled: false,
      cookieDntState: undefined,
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    // Component is rendered synchronously in tests, but we haven't triggered any events
    // that set isActivated to true yet, so it should return null via line 92 (!isActivated)
    expect(screen.queryByTestId('mock-cookie-consent-banner')).not.toBeInTheDocument()
  })

  it('should clean up event listeners and timeout when shouldShow becomes false', () => {
    const { useConsent } = require('@/lib/consent')

    // First render: shouldShow = true
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: false,
      acceptedCategories: [],
      isSettingsOpen: false,
      isDoNotTrackEnabled: false,
      cookieDntState: undefined,
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    const { rerender } = render(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    // Second render: shouldShow = false
    ;(useConsent as jest.Mock).mockReturnValue({
      hasConsented: true, // makes shouldShow = false
      acceptedCategories: ['required'],
      isSettingsOpen: false,
      isDoNotTrackEnabled: false,
      cookieDntState: undefined,
      acceptAll: jest.fn(),
      rejectAll: jest.fn(),
      saveCustom: jest.fn(),
      openSettings: jest.fn(),
      closeSettings: jest.fn(),
    })

    rerender(<DeferredCookieConsentBanner lang="en" direction={DirectionEnum.LTR} />)

    const expectedEvents = ['scroll', 'click', 'keydown', 'touchstart']
    for (const event of expectedEvents) {
      const call = removeEventListenerSpy.mock.calls.find((c: [string, EventListener]) => c[0] === event)
      expect(call).toBeDefined()
    }

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
