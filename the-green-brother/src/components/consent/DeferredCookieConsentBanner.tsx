// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Deferred Cookie Consent Banner Module
 *
 * Lightweight wrapper that delays loading the CookieConsentBanner chunk
 * until the first user interaction (scroll, click, keydown, touchstart)
 * or a fallback timeout. This prevents the banner's JS chunk and CMS
 * API calls from blocking the critical rendering path.
 */

'use client'

import { useConsent } from '@/lib/consent'
import type { DirectionEnum } from '@/lib/generated/types.gen'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

/** Dynamically imported CookieConsentBanner — only loaded after activation. */
const CookieConsentBanner = dynamic(() => import('./CookieConsentBanner'))

/**
 * User interaction events that trigger banner activation.
 * Note: 'scroll' is intentionally excluded to avoid triggering a dynamic import
 * during scroll, which can cause layout shifts (CLS) by blocking the main thread
 * while the banner JS chunk loads. The banner still activates on explicit user
 * interactions (click, keydown, touchstart) or via the fallback timeout.
 */
const ACTIVATION_EVENTS = ['click', 'keydown', 'touchstart'] as const

/** Fallback delay in milliseconds before activating without user interaction. */
const FALLBACK_DELAY_MS = 8000

/** Props for the DeferredCookieConsentBanner component. */
interface DeferredCookieConsentBannerProps {
  /** The current language code for fetching localized CMS content. */
  lang: string
  /** Text direction for RTL/LTR support. */
  direction: DirectionEnum
}

/**
 * Deferred wrapper for CookieConsentBanner.
 *
 * Renders nothing until the user interacts with the page or a fallback
 * timeout elapses, then dynamically loads and renders the actual banner.
 * This avoids loading the banner's JS chunk and triggering CMS API calls
 * during the initial page load, improving performance metrics.
 * @param props - Component props
 * @param props.lang - Language code for localized content
 * @param props.direction - Text direction (ltr/rtl)
 * @returns The CookieConsentBanner after activation, or null before
 */
const DeferredCookieConsentBanner = ({
  lang,
  direction,
}: DeferredCookieConsentBannerProps): React.ReactElement | null => {
  const [isActivated, setIsActivated] = useState(false)
  const { hasConsented, isSettingsOpen, isDoNotTrackEnabled, cookieDntState, acceptedCategories } = useConsent()

  const dntJustEnabled = isDoNotTrackEnabled && (cookieDntState === false || cookieDntState === undefined)

  /** Whether the banner should even consider appearing */
  const shouldShow = !hasConsented || isSettingsOpen || (dntJustEnabled && acceptedCategories.length > 0)

  useEffect(() => {
    // If we definitely shouldn't show the banner, don't set up activation timeouts
    if (!shouldShow) return

    /** Activates the banner by setting state to true. */
    const activate = (): void => {
      setIsActivated(true)
    }

    // Listen for user interaction events (passive, once)
    for (const event of ACTIVATION_EVENTS) {
      window.addEventListener(event, activate, { passive: true, once: true })
    }

    // Fallback: activate after a guaranteed minimum delay.
    // Using setTimeout (not requestIdleCallback) because rIC fires as soon as
    // the browser is idle — often immediately after hydration — which defeats
    // the purpose of deferring the banner away from the critical path.
    const timeoutId = setTimeout(activate, FALLBACK_DELAY_MS)

    return () => {
      for (const event of ACTIVATION_EVENTS) {
        window.removeEventListener(event, activate)
      }
      clearTimeout(timeoutId)
    }
  }, [shouldShow])

  // If the user already consented and hasn't explicitly opened the settings,
  // skip rendering both the wrapper and the dynamic chunk
  if (!shouldShow) return null

  if (!isActivated) return null

  return <CookieConsentBanner lang={lang} direction={direction} />
}

export default DeferredCookieConsentBanner
