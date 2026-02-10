// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

/**
 * CookieSettingsButton Component
 *
 * A client-side button that opens the cookie consent banner in edit mode,
 * allowing users to withdraw or modify their cookie preferences (GDPR Art. 7(3)).
 *
 * Dispatches a custom DOM event that the CookieConsentBanner listens for
 * via the useConsent hook.
 */

import { useCallback } from 'react'

import { openCookieSettings } from '@/lib/consent'

/** Props for the CookieSettingsButton component. */
interface CookieSettingsButtonProps {
  /** The button label text (from CMS or parent component). */
  label: string
}

/**
 * Button that opens the cookie consent settings banner in edit mode.
 *
 * Designed to be placed in the site footer or settings page to give
 * users persistent access to modify their cookie preferences.
 * @param props - Component props
 * @param props.label - The button label text
 * @returns CookieSettingsButton component
 */
const CookieSettingsButton = ({ label }: CookieSettingsButtonProps): React.ReactElement => {
  const handleClick = useCallback(() => {
    openCookieSettings()
  }, [])

  return (
    <button
      onClick={handleClick}
      className="text-xs text-neutral-600 underline-offset-2 transition-colors hover:text-neutral-800 hover:underline dark:text-text-secondary-dark dark:hover:text-text-main-dark"
    >
      {label}
    </button>
  )
}

export default CookieSettingsButton
