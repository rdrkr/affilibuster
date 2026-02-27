// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * useConsent Hook
 *
 * Manages cookie consent state by reading/writing the `cc_consent` cookie.
 * Provides methods to accept all, reject all, or customize consent categories,
 * and records decisions to the backend for GDPR audit trail.
 *
 * Supports consent withdrawal (GDPR Art. 7(3)) via an "edit mode" that
 * re-displays the banner with previously saved preferences for modification.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { ConsentAction, ConsentType } from '@/lib/generated/types.gen'

import { recordConsent } from './api'
import { isDocumentDefined, isSecureContext, isWindowDefined } from './ssr'
import { CONSENT_COOKIE_EXPIRY_DAYS, CONSENT_COOKIE_NAME, type ConsentCookieValue } from './types'

/** Custom DOM event name used to trigger the cookie settings banner. */
export const OPEN_COOKIE_SETTINGS_EVENT = 'affilibuster:open-cookie-settings'

/**
 * Dispatch a custom DOM event to open the cookie consent settings banner.
 *
 * This function is designed to be called from any component (including
 * components that don't use the useConsent hook directly) to trigger
 * the consent banner in edit mode.
 */
export function openCookieSettings(): void {
  if (!isWindowDefined()) return
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))
}

/**
 * Return type of the useConsent hook.
 */
export interface UseConsentReturn {
  /** Whether the user has already given consent (cookie exists). */
  hasConsented: boolean
  /** The currently accepted category UIDs. Empty if no consent given. */
  acceptedCategories: string[]
  /** Whether the consent settings panel is open in edit mode. */
  isSettingsOpen: boolean
  /** Accept all consent categories. */
  acceptAll: (categoryUids: string[], consentVersion: string) => void
  /** Reject all optional consent categories (necessary is always accepted). */
  rejectAll: (necessaryCategoryUid: string, consentVersion: string) => void
  /** Save custom category selection. */
  saveCustom: (selectedUids: string[], consentVersion: string) => void
  /** Open the consent banner in edit mode with previously saved preferences. */
  openSettings: () => void
  /** Close the consent settings panel. */
  closeSettings: () => void
  /** Whether the browser's Do Not Track setting is enabled. */
  isDoNotTrackEnabled: boolean
  /** The state of Do Not Track when consent was saved. */
  cookieDntState?: boolean | undefined
}

/**
 * Read the consent cookie from the browser.
 * @returns The parsed cookie value or null if not found or invalid
 */
export function readConsentCookie(): ConsentCookieValue | null {
  if (!isDocumentDefined()) return null

  const cookies = document.cookie.split('; ')
  const consentCookie = cookies.find(c => c.startsWith(`${CONSENT_COOKIE_NAME}=`))
  if (!consentCookie) return null

  try {
    const rawValue = consentCookie.split('=').slice(1).join('=')
    const value = decodeURIComponent(rawValue)
    return JSON.parse(value) as ConsentCookieValue
  } catch {
    return null
  }
}

/**
 * Write the consent cookie to the browser.
 * @param value - The consent cookie value to persist
 */
export function writeConsentCookie(value: ConsentCookieValue): void {
  if (!isDocumentDefined()) return

  const encoded = encodeURIComponent(JSON.stringify(value))
  const expires = new Date()
  expires.setDate(expires.getDate() + CONSENT_COOKIE_EXPIRY_DAYS)

  const securePart = isSecureContext() ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE_NAME}=${encoded}; path=/; expires=${expires.toUTCString()}; SameSite=Lax${securePart}`
}

/**
 * Hook for managing cookie consent state.
 *
 * Reads the existing consent cookie on mount and provides methods
 * to accept, reject, or customize consent. Each action persists
 * the choice to a first-party cookie and records it to the backend
 * for GDPR audit trail.
 * @returns Consent state and action handlers
 */
export function useConsent(): UseConsentReturn {
  const [cookieValue, setCookieValue] = useState<ConsentCookieValue | null>(() => readConsentCookie())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const hasConsented = cookieValue !== null
  const acceptedCategories = useMemo(() => cookieValue?.categories ?? [], [cookieValue])
  const isDoNotTrackEnabled = typeof navigator !== 'undefined' && navigator.doNotTrack === '1'

  const cookieDntState = cookieValue?.dntStateAtConsent

  // Listen for the custom DOM event to open settings from external components
  useEffect(() => {
    const handler = (): void => {
      setIsSettingsOpen(true)
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler)
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handler)
    }
  }, [])

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const persistConsent = useCallback((categories: string[], consentVersion: string, action: ConsentAction) => {
    const currentDntState = typeof navigator !== 'undefined' && navigator.doNotTrack === '1'
    const value: ConsentCookieValue = {
      categories,
      timestamp: new Date().toISOString(),
      version: consentVersion,
      dntStateAtConsent: currentDntState,
    }

    writeConsentCookie(value)
    setCookieValue(value)
    setIsSettingsOpen(false)

    // Fire-and-forget: record to backend for audit trail
    void recordConsent({
      consentType: ConsentType.COOKIE,
      action,
      categories: {
        necessary: true,
        analytics: categories.includes('analytics'),
        marketing: categories.includes('marketing'),
        functional: categories.includes('functional'),
      },
      consentVersion,
    })
  }, [])

  const acceptAll = useCallback(
    (categoryUids: string[], consentVersion: string) => {
      persistConsent(categoryUids, consentVersion, ConsentAction.ACCEPT_ALL)
    },
    [persistConsent]
  )

  const rejectAll = useCallback(
    (necessaryCategoryUid: string, consentVersion: string) => {
      persistConsent([necessaryCategoryUid], consentVersion, ConsentAction.REJECT_ALL)
    },
    [persistConsent]
  )

  const saveCustom = useCallback(
    (selectedUids: string[], consentVersion: string) => {
      persistConsent(selectedUids, consentVersion, ConsentAction.CUSTOM)
    },
    [persistConsent]
  )

  return {
    hasConsented,
    acceptedCategories,
    isSettingsOpen,
    acceptAll,
    rejectAll,
    saveCustom,
    openSettings,
    closeSettings,
    isDoNotTrackEnabled,
    cookieDntState,
  }
}
