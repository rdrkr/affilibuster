// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Tests for useConsent hook.
 *
 * Verifies cookie read/write, consent state management,
 * backend recording integration, and consent withdrawal
 * (edit mode via openSettings/closeSettings and DOM events).
 */

import { act, renderHook } from '@testing-library/react'

import { useConsent, openCookieSettings, OPEN_COOKIE_SETTINGS_EVENT } from '@/lib/consent/useConsent'
import * as consentApi from '@/lib/consent/api'
import { CONSENT_COOKIE_NAME } from '@/lib/consent/types'
import { ConsentAction, ConsentType } from '@/lib/generated/types.gen'

jest.mock('@/lib/consent/api', () => ({
  recordConsent: jest.fn().mockResolvedValue({ success: true, consentId: 'id-1', message: 'ok' }),
}))

const mockRecordConsent = consentApi.recordConsent as jest.MockedFunction<typeof consentApi.recordConsent>

/**
 * Helper to set document.cookie for testing.
 * @param value - The consent cookie value to set.
 * @param value.categories - Accepted category UIDs.
 * @param value.timestamp - ISO timestamp of consent.
 * @param value.version - Consent version string.
 */
function setConsentCookie(value: { categories: string[]; timestamp: string; version: string }): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; path=/`
}

/** Helper to clear the consent cookie. */
function clearConsentCookie(): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

beforeEach(() => {
  jest.clearAllMocks()
  clearConsentCookie()
})

afterEach(() => {
  clearConsentCookie()
})

describe('useConsent', () => {
  describe('initial state', () => {
    it('should return hasConsented false when no cookie exists', () => {
      const { result } = renderHook(() => useConsent())

      expect(result.current.hasConsented).toBe(false)
      expect(result.current.acceptedCategories).toEqual([])
    })

    it('should return hasConsented true when cookie exists', () => {
      setConsentCookie({
        categories: ['necessary', 'analytics'],
        timestamp: '2026-01-01T00:00:00.000Z',
        version: '1.0',
      })

      const { result } = renderHook(() => useConsent())

      expect(result.current.hasConsented).toBe(true)
      expect(result.current.acceptedCategories).toEqual(['necessary', 'analytics'])
    })

    it('should handle invalid cookie JSON gracefully', () => {
      document.cookie = `${CONSENT_COOKIE_NAME}=invalid-json; path=/`

      const { result } = renderHook(() => useConsent())

      expect(result.current.hasConsented).toBe(false)
      expect(result.current.acceptedCategories).toEqual([])
    })

    it('should return isSettingsOpen false initially', () => {
      const { result } = renderHook(() => useConsent())

      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('acceptAll', () => {
    it('should set cookie with all category UIDs', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.acceptAll(['necessary', 'analytics', 'marketing'], '2.0')
      })

      expect(result.current.hasConsented).toBe(true)
      expect(result.current.acceptedCategories).toEqual(['necessary', 'analytics', 'marketing'])
    })

    it('should record consent to backend with ACCEPT_ALL action', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.acceptAll(['necessary', 'analytics', 'marketing'], '1.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith({
        consentType: ConsentType.COOKIE,
        action: ConsentAction.ACCEPT_ALL,
        categories: {
          necessary: true,
          analytics: true,
          marketing: true,
          functional: false,
        },
        consentVersion: '1.0',
      })
    })

    it('should persist cookie to document', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.acceptAll(['necessary'], '1.0')
      })

      expect(document.cookie).toContain(CONSENT_COOKIE_NAME)
    })

    it('should close settings when consent is persisted', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.acceptAll(['necessary', 'analytics'], '1.0')
      })

      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('rejectAll', () => {
    it('should set cookie with only the necessary category UID', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.rejectAll('necessary', '1.0')
      })

      expect(result.current.hasConsented).toBe(true)
      expect(result.current.acceptedCategories).toEqual(['necessary'])
    })

    it('should record consent to backend with REJECT_ALL action', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.rejectAll('necessary', '1.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith({
        consentType: ConsentType.COOKIE,
        action: ConsentAction.REJECT_ALL,
        categories: {
          necessary: true,
          analytics: false,
          marketing: false,
          functional: false,
        },
        consentVersion: '1.0',
      })
    })

    it('should close settings when consent is persisted via rejectAll', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.rejectAll('necessary', '1.0')
      })

      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('saveCustom', () => {
    it('should set cookie with selected categories', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.saveCustom(['necessary', 'analytics'], '1.5')
      })

      expect(result.current.hasConsented).toBe(true)
      expect(result.current.acceptedCategories).toEqual(['necessary', 'analytics'])
    })

    it('should record consent to backend with CUSTOM action', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.saveCustom(['necessary', 'marketing'], '1.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith({
        consentType: ConsentType.COOKIE,
        action: ConsentAction.CUSTOM,
        categories: {
          necessary: true,
          analytics: false,
          marketing: true,
          functional: false,
        },
        consentVersion: '1.0',
      })
    })

    it('should set analytics and marketing to false when not selected', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.saveCustom(['necessary'], '1.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: {
            necessary: true,
            analytics: false,
            marketing: false,
            functional: false,
          },
        })
      )
    })

    it('should close settings when consent is persisted via saveCustom', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.saveCustom(['necessary', 'analytics'], '1.0')
      })

      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('cookie version tracking', () => {
    it('should include consent version in recorded consent', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.acceptAll(['necessary'], '3.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith(expect.objectContaining({ consentVersion: '3.0' }))
    })
  })

  describe('openSettings / closeSettings', () => {
    it('should set isSettingsOpen to true when openSettings is called', () => {
      const { result } = renderHook(() => useConsent())

      expect(result.current.isSettingsOpen).toBe(false)

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.isSettingsOpen).toBe(true)
    })

    it('should set isSettingsOpen to false when closeSettings is called', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.openSettings()
      })

      expect(result.current.isSettingsOpen).toBe(true)

      act(() => {
        result.current.closeSettings()
      })

      expect(result.current.isSettingsOpen).toBe(false)
    })
  })

  describe('DOM event listener', () => {
    it('should set isSettingsOpen to true when custom DOM event is dispatched', () => {
      const { result } = renderHook(() => useConsent())

      expect(result.current.isSettingsOpen).toBe(false)

      act(() => {
        window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))
      })

      expect(result.current.isSettingsOpen).toBe(true)
    })

    it('should clean up event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useConsent())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(OPEN_COOKIE_SETTINGS_EVENT, expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('openCookieSettings', () => {
    it('should dispatch the custom DOM event', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')

      openCookieSettings()

      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent))
      const dispatched = dispatchEventSpy.mock.calls[0]![0] as CustomEvent
      expect(dispatched.type).toBe(OPEN_COOKIE_SETTINGS_EVENT)

      dispatchEventSpy.mockRestore()
    })

    it('should not throw when window is undefined', () => {
      const originalWindow = globalThis.window

      ;(globalThis as any).window = undefined

      expect(() => {
        openCookieSettings()
      }).not.toThrow()

      globalThis.window = originalWindow
    })
  })

  describe('isDoNotTrackEnabled', () => {
    it('should return true when navigator.doNotTrack is "1"', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })

      const { result } = renderHook(() => useConsent())

      expect(result.current.isDoNotTrackEnabled).toBe(true)

      Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true })
    })

    it('should return false when navigator.doNotTrack is "0"', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })

      const { result } = renderHook(() => useConsent())

      expect(result.current.isDoNotTrackEnabled).toBe(false)

      Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true })
    })

    it('should return false when navigator.doNotTrack is null', () => {
      Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true })

      const { result } = renderHook(() => useConsent())

      expect(result.current.isDoNotTrackEnabled).toBe(false)
    })
  })

  describe('functional category in consent recording', () => {
    it('should include functional true when functional is in accepted categories', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.acceptAll(['necessary', 'analytics', 'marketing', 'functional'], '1.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: expect.objectContaining({
            functional: true,
          }),
        })
      )
    })

    it('should include functional false when functional is not in accepted categories', () => {
      const { result } = renderHook(() => useConsent())

      act(() => {
        result.current.acceptAll(['necessary', 'analytics'], '1.0')
      })

      expect(mockRecordConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: expect.objectContaining({
            functional: false,
          }),
        })
      )
    })
  })

  describe('OPEN_COOKIE_SETTINGS_EVENT', () => {
    it('should be a string constant', () => {
      expect(typeof OPEN_COOKIE_SETTINGS_EVENT).toBe('string')
      expect(OPEN_COOKIE_SETTINGS_EVENT).toBe('affilibuster:open-cookie-settings')
    })
  })
})
